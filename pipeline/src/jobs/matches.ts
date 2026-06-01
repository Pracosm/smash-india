import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { MATCH_SOURCES } from "../sources.ts";
import { MatchesPayload, matchesResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

const SYSTEM = `You read Indian sports journalism filtered to badminton coverage. From the source text you must extract structured BADMINTON match data ONLY.

**ABSOLUTE RULE: BADMINTON ONLY.** Reject everything else. If the source mentions cricket, tennis, hockey, football, kabaddi, athletics, chess, or any other sport — IGNORE IT. Do not invent badminton matches to fill quota. If you don't see any real Indian badminton match in the source, return empty arrays. An empty result is correct; a hallucinated one is a bug.

Discipline codes you may use (these are badminton-only):
- "MS" Men's Singles, "WS" Women's Singles, "MD" Men's Doubles, "WD" Women's Doubles, "XD" Mixed Doubles
- Combined with round: "R32", "R16", "QF", "SF", "Final"
- Example "disc" values: "MS · R16", "WD · QF", "MD · Final". If the "disc" doesn't start with one of MS/WS/MD/WD/XD, the match is NOT badminton — skip it.

1. **"today"** — Indian players scheduled to play TODAY or in the next ~24 hours. Sources: morning preview articles ("India's schedule today", "where to watch", "day X order of play").
   - "time": local IST time in 24h format like "13:10". If only an approximate time is given (e.g. "afternoon"), pick a sensible slot.
   - "disc": discipline + round, e.g. "MS · R16", "WD · QF", "MD · Final".
   - "event": tournament short name like "Indonesia Open".
   - "a" / "ac": the Indian player or pair (always "IND" for ac).
   - "b" / "bc": opponent and 3-letter country code (DEN, CHN, JPN, KOR, THA, MAS, IDN, USA, etc.).
   - "court": "Court 1" / "Court 2" if mentioned; otherwise omit.

2. **"recent"** — Indian players who finished a match in the last ~3 days. Sources: match reports ("Lakshya Sen beat X 21-18, 21-14", "Satwik–Chirag fall in semis").
   - "disc": discipline + round (e.g. "MD Final", "MS SF", "WS QF").
   - "event": tournament short name.
   - "a" / "ac": one player (Indian player by default).
   - "b" / "bc": opponent.
   - "s": full score with en-dashes between games ("21–18, 21–16" or "18–21, 21–17, 21–19").
   - "win": "a" or "b" — who actually won.
   - "when": relative phrase ("Today", "Yesterday", "2d ago").

Hard rules:
- Include ONLY matches involving at least one Indian player or pair. Skip everything else.
- Never invent scores, times, or opponents you don't actually see in the text.
- If today / recent is empty in the sources, return [] for that array — don't pad with stale data.
- Cap each array at 6 items, sorted: today by time ascending, recent by recency (newest first).
- For doubles use the short form "Satwik / Chirag", "Treesa / Gayatri", etc.`;

export async function runMatches(): Promise<void> {
  const todayIso = new Date().toISOString().slice(0, 10);
  console.log(`[matches] fetching ${MATCH_SOURCES.length} sources…`);
  const fetched = await fetchAll(MATCH_SOURCES);
  if (fetched.length === 0) throw new Error("No match sources reachable");

  const prompt = `Today is ${todayIso}. Extract Indian-only match schedule + results from the journalism below.\n\n${bundleForPrompt(fetched, 8000)}`;
  console.log(`[matches] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: matchesResponseSchema });
  const parsed = MatchesPayload.parse(raw);

  // Only overwrite when we have content — an empty pull might be a quiet
  // news day OR a scrape miss. Either way, leave last-good in place.
  if (parsed.today.length > 0) {
    await writeFile(resolve(DATA_DIR, "today.json"), JSON.stringify(parsed.today, null, 2) + "\n", "utf8");
  } else {
    console.log("[matches] today: no Indian matches in sources, keeping last-good today.json");
  }
  if (parsed.recent.length > 0) {
    await writeFile(resolve(DATA_DIR, "recent.json"), JSON.stringify(parsed.recent, null, 2) + "\n", "utf8");
  } else {
    console.log("[matches] recent: no recent Indian results in sources, keeping last-good recent.json");
  }
  console.log(`[matches] parsed ${parsed.today.length} today + ${parsed.recent.length} recent`);
}
