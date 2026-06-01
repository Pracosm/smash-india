import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { NEWS_SOURCES } from "../sources.ts";
import { NewsPayload, newsResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

const SYSTEM = `You are the editor of an Indian-badminton-only news site. From the source text below — which mixes Indian and foreign coverage — you must produce:

1. A short newsfeed of 4–6 items where India IS the angle. Skip stories with no Indian player, coach, or event involvement.
2. A single "fresh result" highlight — the most recent notable result featuring an Indian player or pair, with the discipline and score.

Style rules:
- titles are concise headlines (max ~14 words), no clickbait
- "slug" is a unique, kebab-case version of the title, stripped of punctuation, max 60 chars (e.g. "satwik-chirag-singapore-open-champions")
- "kicker" is one of: Match Report, Preview, Feature, Domestic, Ranking, Opinion, Result
- "time" is a relative phrase ("3h ago", "Yesterday", "2d ago") inferred from publish dates
- "read" is an estimated read time like "4 min"
- importance_score 1–10 (10 = title win, 1 = minor preview)
- indian_angle is one sentence on why an Indian fan cares
- in "freshResult.tag", use one of: CHAMPIONS, FINALISTS, SEMIFINALISTS, QUARTERFINALISTS, RESULT
- if there is no real Indian fresh result in the sources, return the most recent Indian match outcome you can see, even if a loss.`;

export async function runNews(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[news] fetching ${NEWS_SOURCES.length} sources…`);
  const fetched = await fetchAll(NEWS_SOURCES);
  if (fetched.length === 0) throw new Error("No news sources reachable");

  const prompt = `Today is ${today}. Pick stories from the sources below.\n\n${bundleForPrompt(fetched)}`;
  console.log(`[news] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: newsResponseSchema });
  const parsed = NewsPayload.parse(raw);

  await writeFile(resolve(DATA_DIR, "news.json"), JSON.stringify(parsed.news, null, 2) + "\n", "utf8");
  await writeFile(resolve(DATA_DIR, "fresh-result.json"), JSON.stringify(parsed.freshResult, null, 2) + "\n", "utf8");
  console.log(`[news] wrote ${parsed.news.length} items + fresh result`);
}
