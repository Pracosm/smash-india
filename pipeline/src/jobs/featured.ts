import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { NEWS_SOURCES, MATCH_SOURCES } from "../sources.ts";
import { bwfUrlFor } from "../bwf-urls.ts";
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
  flag?: string;
  dates?: string;
  startsAt?: string;
  endsAt?: string;
  drawSize?: number;
  disciplines?: number;
  bwfUrl?: string;
  venue?: { name?: string; capacity?: number; city?: string; blurb?: string };
  broadcasters?: Array<{ label: string; region: string }>;
  recentChampions?: unknown[];
  indiaHistory?: unknown[];
  summary?: string;
  stakes?: string;
  indiaContingent?: Array<Record<string, unknown>>;
  [k: string]: unknown;
}

interface NextEvent {
  name?: string;
  grade?: string;
  city?: string;
  venue?: string;
  dates?: string;
  startsAt?: string;
  broadcaster?: string;
}

interface ScheduleEntry {
  slug?: string;
  name?: string;
  flag?: string;
  grade?: string;
  city?: string;
  soon?: boolean;
  bwfUrl?: string;
}

function slugify(s: string | undefined): string {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Build a fresh featured-event scaffold from the next-event + schedule feeds.
// Used when the editor's current featured event has ended and nothing newer
// has been hand-curated. Hand-curated fields (venue blurb, recentChampions,
// indiaHistory) are left blank for the editor to refill at leisure — the
// daily refresh fills in summary / stakes / India contingent.
function buildScaffold(next: NextEvent, schedule: ScheduleEntry[]): FeaturedEvent | null {
  if (!next?.name || !next.startsAt) return null;
  const startsAt = new Date(next.startsAt);
  if (!Number.isFinite(startsAt.getTime())) return null;
  const slug = slugify(next.name);
  const scheduleEntry = schedule.find((e) => e.slug === slug) ?? schedule.find((e) => e.soon);
  const year = startsAt.getFullYear();
  // Best-guess endsAt — most BWF events are 6 days; the editor will overwrite
  // this when they reach the rich page anyway.
  const endsAt = new Date(startsAt.getTime() + 6 * 86_400_000);

  return {
    slug,
    name: next.name,
    edition: String(year),
    fullName: next.name,
    grade: next.grade ?? scheduleEntry?.grade ?? "BWF World Tour",
    city: next.city,
    country: undefined,
    flag: scheduleEntry?.flag,
    dates: next.dates,
    startsAt: next.startsAt,
    endsAt: endsAt.toISOString(),
    drawSize: 32,
    disciplines: 5,
    bwfUrl: scheduleEntry?.bwfUrl ?? bwfUrlFor(slug),
    venue: { name: next.venue, blurb: "" },
    broadcasters: next.broadcaster ? [{ label: next.broadcaster, region: "India" }] : [],
    recentChampions: [],
    indiaHistory: [],
    stakes: "",
    summary: "",
    indiaContingent: [],
  };
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
  const [existingRaw, players, rankings, nextEvent, schedule] = await Promise.all([
    readJsonSafe<FeaturedEvent | null>("featured-event.json", null),
    readJsonSafe<PlayerRow[]>("players.json", []),
    readJsonSafe<RankingRow[]>("rankings.json", []),
    readJsonSafe<NextEvent>("next-event.json", {}),
    readJsonSafe<ScheduleEntry[]>("schedule.json", []),
  ]);

  // Auto-rotate when the current featured event has ended (or there is none).
  // We pull the new scaffold from next-event.json + schedule.json — both are
  // refreshed earlier in the same daily pipeline, so the cadence works out.
  let existing = existingRaw;
  const endsAt = existing?.endsAt ? new Date(existing.endsAt).getTime() : NaN;
  const eventOver = Number.isFinite(endsAt) && endsAt < Date.now() - 36 * 3600 * 1000;
  if (!existing || !existing.slug || eventOver) {
    const scaffold = buildScaffold(nextEvent, schedule);
    if (!scaffold) {
      console.log("[featured] no current event and next-event.json is empty — nothing to refresh.");
      return;
    }
    const reason = !existing || !existing.slug ? "no existing event" : `${existing.slug} ended on ${existing.endsAt}`;
    console.log(`[featured] auto-rotating featured event (${reason}) → ${scaffold.slug} (${scaffold.name}).`);
    existing = scaffold;
    // Persist the scaffold before the refresh so a Gemini failure here still
    // leaves the site pointed at the right tournament.
    await writeFile(resolve(DATA_DIR, "featured-event.json"), JSON.stringify(existing, null, 2) + "\n", "utf8");
  }

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
