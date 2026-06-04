import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { NEWS_SOURCES, MATCH_SOURCES } from "../sources.ts";
import { PlayerUpdatesPayload, playerUpdatesResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

interface RawPlayer {
  slug: string;
  name: string;
  role: string;
  rank?: number;
  form?: ("W" | "L")[];
  note?: string;
  hot?: boolean;
  [k: string]: unknown;
}

interface RankingRow {
  disc: string;
  name: string;
  rank: number;
  pts: string;
}

const DISC_BY_ROLE: Record<string, string> = {
  "Men's Singles": "Men's Singles",
  "Women's Singles": "Women's Singles",
  "Men's Doubles": "Men's Doubles",
  "Women's Doubles": "Women's Doubles",
  "Mixed Doubles": "Mixed Doubles",
};

const SYSTEM = `You maintain a roster of Indian badminton players' live profile cards. For each player the user lists, you produce updated dynamic fields ONLY — identity (name, photo, role, bio) is owned by the editor and you must not touch it.

Output an "updates" array. Each entry must include the player's slug verbatim (from the input roster) plus:
- "rank": current BWF world rank for that player in their discipline. Use the "Latest BWF rankings" block if the player appears there. Otherwise infer from the source text ("Lakshya Sen, world No. 12"). If you genuinely cannot find a rank, keep the player's previous rank from the input roster.
- "form": last up-to-5 match outcomes for that player, newest first, each "W" or "L". Mine match reports in the news text. If you can only find 2–3 confidently, return just those — do NOT pad with guesses. If you find nothing new, return the previous form from the input roster verbatim.
- "note": 3–8 word context tag for the home card ("Singapore champions", "Career-high ranking", "Rebuilding the engine", "5 SF in 7 events"). Punchy, present-tense, no marketing fluff.
- "hot": true ONLY for a player who has just won a Super 500+ title or hit a career-high ranking in the past ~2 weeks. Default false / omit otherwise. At most TWO players should be hot at any time.

Also output a "recent" array — the actual matches you mined to derive the form values above. **Every W/L you put in the form must have a corresponding entry in "recent"** if (and only if) the journalism gave you the opponent + score. Same source, same conclusion — keep them consistent.

Each "recent" entry:
- "disc": badminton discipline + round, must start with one of "MS"/"WS"/"MD"/"WD"/"XD". Examples: "MS R32", "MD QF", "WS SF", "MD Final". If the source doesn't say the round, "MS R32" is the safest default for an early-tournament loss; "MD Final" for a title win.
- "event": short tournament name ("Indonesia Open", "Singapore Open").
- "a": the Indian player or pair, short form ("Lakshya Sen", "Satwik / Chirag", "Treesa / Gayatri", "PV Sindhu").
- "ac": "IND" (always — entries must include an Indian).
- "b": opponent player or pair, short form ("An Se Young", "Liang / Wang", "Anders Antonsen", "Weng Hong Yang").
- "bc": opponent's 3-letter country code (KOR, CHN, DEN, MAS, JPN, THA, IDN, USA, etc.).
- "s": full score, en-dashes between games ("21–18, 21–16", or "19–21, 21–15, 15–21" for a three-gamer).
- "win": "a" if the Indian won, "b" if the opponent won.
- "when": relative phrase ("Today", "Yesterday", "2d ago", "6d ago").

Hard rules:
- One updates entry per input player, slug exactly as given. No invented players.
- Form is newest-first. A loss yesterday + a win two weeks ago → ["L", "W"], not ["W", "L"].
- For doubles pairs ("Satwik & Chirag", "Treesa & Gayatri"), the form is the pair's combined recent results, and "recent" entries use "Satwik / Chirag" / "Treesa / Gayatri" form for "a".
- If a player isn't mentioned at all in the sources and isn't in the rankings block, copy their previous rank/form/note from the input roster verbatim. An honest carryover beats invented data.
- NEVER invent a score, opponent, or round. If the journalism only says "Lakshya lost in the round of 32" without naming the opponent, do NOT add a recent entry for it.
- Cap "recent" at ~12 entries total, sorted newest first.`;

async function readJsonSafe<T>(file: string, fallback: T): Promise<T> {
  try {
    const txt = await readFile(resolve(DATA_DIR, file), "utf8");
    return JSON.parse(txt) as T;
  } catch {
    return fallback;
  }
}

export async function runProfiles(): Promise<void> {
  const players = await readJsonSafe<RawPlayer[]>("players.json", []);
  if (!Array.isArray(players) || players.length === 0) {
    throw new Error("players.json is empty — seed the roster manually first.");
  }
  const rankings = await readJsonSafe<RankingRow[]>("rankings.json", []);

  console.log(`[profiles] fetching ${NEWS_SOURCES.length + MATCH_SOURCES.length} news + match sources…`);
  // De-dup by URL — news and matches share Indian Express + Hindustan Times feeds.
  const merged = [...NEWS_SOURCES, ...MATCH_SOURCES];
  const uniq = merged.filter((s, i) => merged.findIndex((x) => x.url === s.url) === i);
  const fetched = await fetchAll(uniq);
  if (fetched.length === 0) throw new Error("No profile sources reachable");

  const today = new Date().toISOString().slice(0, 10);

  // Send the roster + current rankings + recent journalism to Gemini.
  const rosterForPrompt = players.map((p) => ({
    slug: p.slug,
    name: p.name,
    role: p.role,
    rank: p.rank,
    form: p.form,
    note: p.note,
    hot: p.hot ?? false,
  }));

  // Restrict the rankings table to the discs we care about for these players,
  // so Gemini doesn't get distracted by entries for disciplines no rostered
  // Indian plays.
  const wantedDiscs = new Set(players.map((p) => DISC_BY_ROLE[p.role]).filter(Boolean));
  const rankingsForPrompt = rankings.filter((r) => wantedDiscs.has(r.disc));

  const prompt = `Today is ${today}. Update the roster's dynamic fields from the journalism + rankings below.

### Player roster (use slugs verbatim, do not invent players)
${JSON.stringify(rosterForPrompt, null, 2)}

### Latest BWF rankings (filtered to disciplines on the roster)
${JSON.stringify(rankingsForPrompt, null, 2)}

### Recent journalism (extract match results from match reports)
${bundleForPrompt(fetched, 9000)}`;

  console.log(`[profiles] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: playerUpdatesResponseSchema });
  const parsed = PlayerUpdatesPayload.parse(raw);

  // Cap hot to 2 — Gemini sometimes over-stamps.
  const hotCount = parsed.updates.filter((u) => u.hot).length;
  if (hotCount > 2) {
    let kept = 0;
    for (const u of parsed.updates) if (u.hot && ++kept > 2) u.hot = false;
    console.log(`[profiles] capped "hot" flag from ${hotCount} to 2`);
  }

  // Merge updates into existing roster, preserving identity fields.
  const updatesBySlug = new Map(parsed.updates.map((u) => [u.slug, u]));
  let touched = 0;
  let carried = 0;
  const merged_out = players.map((p) => {
    const u = updatesBySlug.get(p.slug);
    if (!u) {
      carried++;
      return p; // no update for this slug — keep as is
    }
    touched++;
    const next: RawPlayer = { ...p, rank: u.rank, form: u.form, note: u.note };
    if (u.hot) next.hot = true;
    else delete next.hot;
    return next;
  });

  await writeFile(resolve(DATA_DIR, "players.json"), JSON.stringify(merged_out, null, 2) + "\n", "utf8");
  console.log(`[profiles] wrote ${merged_out.length} players (${touched} refreshed, ${carried} carried)`);

  // Same Gemini call also gave us structured recent results — write those
  // to recent.json so the player-profile route can render scores alongside
  // the W/L stripes. An empty result means Gemini couldn't confidently
  // structure any match; leave last-good in place rather than wiping it.
  if (Array.isArray(parsed.recent) && parsed.recent.length > 0) {
    await writeFile(resolve(DATA_DIR, "recent.json"), JSON.stringify(parsed.recent, null, 2) + "\n", "utf8");
    console.log(`[profiles] wrote ${parsed.recent.length} recent matches`);
  } else {
    console.log("[profiles] no structured recent matches — keeping last-good recent.json");
  }
}
