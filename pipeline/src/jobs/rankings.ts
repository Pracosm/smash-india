import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { RANKINGS_SOURCES } from "../sources.ts";
import { RankingsPayload, rankingsResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

const SYSTEM = `You read BWF world ranking tables. From the source pages — one per discipline — extract the top Indian entries across all disciplines (men's singles, women's singles, men's doubles, women's doubles, mixed doubles). Output up to 8 of the best-ranked Indian players or pairs, sorted by rank ascending.

Field rules:
- "disc": "Men's Singles" | "Women's Singles" | "Men's Doubles" | "Women's Doubles" | "Mixed Doubles"
- "name": clean display name. For doubles, use "Surname & Surname" or the most common short form (e.g. "Satwik & Chirag", "Treesa & Gayatri")
- "rank": integer world rank
- "move": "up" | "down" | "same" — infer from the source. If the source doesn't say, use "same"
- "pts": ranking points as a string with thousand separators ("92,540")

Only include Indian players. Skip the rest.`;

export async function runRankings(): Promise<void> {
  console.log(`[rankings] fetching ${RANKINGS_SOURCES.length} sources…`);
  const fetched = await fetchAll(RANKINGS_SOURCES);
  if (fetched.length === 0) throw new Error("No rankings sources reachable");

  const prompt = `Extract Indian players from the BWF ranking tables below.\n\n${bundleForPrompt(fetched, 8000)}`;
  console.log(`[rankings] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: rankingsResponseSchema });
  const parsed = RankingsPayload.parse(raw);

  await writeFile(resolve(DATA_DIR, "rankings.json"), JSON.stringify(parsed.rankings, null, 2) + "\n", "utf8");
  console.log(`[rankings] wrote ${parsed.rankings.length} entries`);
}
