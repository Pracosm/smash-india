import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { NEWS_SOURCES, MATCH_SOURCES } from "../sources.ts";
import { FeaturedRefresh, featuredRefreshResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

// Fields we refresh from sources. Anything not listed here is preserved
// verbatim from the existing featured-event.json so the editor's curated
// venue blurb, champions list, India history etc. survive the refresh.
const DYNAMIC_KEYS = new Set(["summary", "stakes", "indiaContingent"]);

interface FeaturedEvent {
  slug: string;
  name: string;
  fullName?: string;
  edition?: string;
  grade?: string;
  city?: string;
  country?: string;
  dates?: string;
  startsAt?: string;
  endsAt?: string;
  drawSize?: number;
  summary?: string;
  stakes?: string;
  indiaContingent?: Array<Record<string, unknown>>;
  [k: string]: unknown;
}

interface PlayerRow {
  slug: string;
  name: string;
  role: string;
  rank?: number;
}

interface RankingRow {
  disc: string;
  name: string;
  rank: number;
}

const SYSTEM = `You refresh the live storyline + India draw for a single featured BWF tournament page. The user gives you the event metadata, the existing India contingent (you are updating it, not replacing identity), the current Indian roster + rankings, and recent journalism.

Produce three things:

1. **"summary"** — markdown, 2–3 paragraphs (≤ 1500 chars total). The state of India's campaign at this event right now: who's seeded, who's drawn into a tough opener, who's coming in hot or banged up. Voice: warm, knowledgeable, like The Athletic. Allowed markdown: paragraphs, **bold**, em-dashes. No headings.

2. **"stakes"** — one punchy sentence (≤ 200 chars) on what this week means for India.

3. **"indiaContingent"** — the updated draw card for each Indian entry at this tournament. Keep ONE entry per Indian player or pair present in the existing contingent. For each:
   - "name": display name (keep doubles short, e.g. "Satwik & Chirag", "Treesa & Gayatri")
   - "discipline": "Men's Singles" | "Women's Singles" | "Men's Doubles" | "Women's Doubles" | "Mixed Doubles"
   - "playerSlug": pick from the roster if it matches; otherwise omit
   - "rank": current world rank from the rankings block (or last known if absent)
   - "seed": integer if the player is seeded in this draw, else omit
   - "draw": their current round + opponent if known ("R32 vs Kunlavut Vitidsarn (THA)"). Use the most recent round mentioned in the journalism. If the bracket hasn't dropped yet, "R32 — TBD" is fine.
   - "note": 4–10 word context tag ("Defending champions", "First Super 1000 of the rebuild")

Hard rules:
- Only Indian entries in the contingent.
- Don't drop players who are in the existing contingent unless they've explicitly withdrawn (then note it). Order: best seed first, then by world rank.
- Don't invent matchups not in the source text. "R32 — TBD" is honest; "R32 vs <plausible opponent>" is a hallucination.`;

async function readJsonSafe<T>(file: string, fallback: T): Promise<T> {
  try {
    const txt = await readFile(resolve(DATA_DIR, file), "utf8");
    return JSON.parse(txt) as T;
  } catch {
    return fallback;
  }
}

export async function runFeatured(): Promise<void> {
  const existing = await readJsonSafe<FeaturedEvent | null>("featured-event.json", null);
  if (!existing || !existing.slug) {
    console.log("[featured] no featured-event.json on disk — skipping (editor must seed it).");
    return;
  }
  // If the event is plainly over, refreshing it would just churn stale content.
  // The editor is expected to swap featured-event.json to the next event.
  const endsAt = existing.endsAt ? new Date(existing.endsAt).getTime() : NaN;
  if (Number.isFinite(endsAt) && endsAt < Date.now() - 36 * 3600 * 1000) {
    console.log(`[featured] ${existing.slug} ended on ${existing.endsAt} — skipping refresh; editor should swap to the next event.`);
    return;
  }

  const [players, rankings] = await Promise.all([
    readJsonSafe<PlayerRow[]>("players.json", []),
    readJsonSafe<RankingRow[]>("rankings.json", []),
  ]);

  console.log(`[featured] refreshing "${existing.name}" — fetching ${NEWS_SOURCES.length + MATCH_SOURCES.length} sources…`);
  const merged = [...NEWS_SOURCES, ...MATCH_SOURCES];
  const uniq = merged.filter((s, i) => merged.findIndex((x) => x.url === s.url) === i);
  const fetched = await fetchAll(uniq);
  if (fetched.length === 0) throw new Error("No featured-refresh sources reachable");

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Today is ${today}. Refresh the storyline + India draw for ${existing.name} (${existing.fullName ?? existing.name}).

### Event metadata (fixed)
${JSON.stringify({
    slug: existing.slug,
    name: existing.name,
    fullName: existing.fullName,
    grade: existing.grade,
    city: existing.city,
    country: existing.country,
    dates: existing.dates,
    drawSize: existing.drawSize,
  }, null, 2)}

### Existing India contingent at this event (update, don't replace)
${JSON.stringify(existing.indiaContingent ?? [], null, 2)}

### Indian roster + current ranks
${JSON.stringify(players.map((p) => ({ slug: p.slug, name: p.name, role: p.role, rank: p.rank })), null, 2)}

### Latest BWF rankings
${JSON.stringify(rankings, null, 2)}

### Recent journalism
${bundleForPrompt(fetched, 9000)}`;

  console.log(`[featured] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: featuredRefreshResponseSchema });
  const parsed = FeaturedRefresh.parse(raw);

  // Merge: preserve every existing key, overwrite only the dynamic ones.
  const next: FeaturedEvent = { ...existing };
  for (const key of DYNAMIC_KEYS) {
    const v = (parsed as unknown as Record<string, unknown>)[key];
    if (v !== undefined) next[key] = v;
  }

  await writeFile(resolve(DATA_DIR, "featured-event.json"), JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log(`[featured] wrote ${existing.slug} (refreshed ${[...DYNAMIC_KEYS].join(", ")}; ${parsed.indiaContingent.length} contingent entries)`);
}
