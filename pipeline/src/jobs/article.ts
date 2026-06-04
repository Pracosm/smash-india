import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import slugify from "slugify";
import { geminiJSON } from "../gemini.ts";
import { ArticlesPayload, articlesResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

const ROLL_DAYS = 30;

const SYSTEM = `You are the staff writer for an Indian-badminton-only news site. Each day you publish 1–2 editorial pieces (300–500 words each) that frame the day's badminton story through an Indian lens. Voice: warm, knowledgeable, like The Athletic — never breathless or jingoistic.

Kicker choices: "Daily Brief" (overnight roundup), "Feature" (1 player or theme), "Preview" (next tournament), "Match Report" (Indian-relevant final), "Opinion" (a take).

Hard rules:
- Only stories where India is genuinely the angle. Skip non-Indian fluff.
- "body" is markdown. Use short paragraphs. Allowed: paragraphs, **bold**, em-dashes. Avoid h1/h2 (the title is rendered above the body).
- Don't invent results that aren't in the source material. If you don't have score detail, write around it.
- "indianAngle" is a single hook sentence shown above the dek on the page.
- "tags" are short kebab-case strings: player slugs (e.g. "satwik-chirag", "lakshya-sen", "pv-sindhu") and event slugs ("indonesia-open").
- "heroPlayerSlug" — pick one of the known player slugs if the piece is mainly about that player: satwik-chirag, lakshya-sen, pv-sindhu, treesa-gayatri, hs-prannoy, malvika-bansod. Omit if it's a general brief.
- "readMinutes" — honest estimate based on body length (200 words ≈ 1 min).
- Slug must be unique and reflect the title.
- publishedAt = today's date in ISO 8601 with +05:30 offset (IST).`;

interface ExistingArticle {
  slug: string;
  publishedAt: string;
  [k: string]: unknown;
}

async function readJsonSafe<T>(file: string, fallback: T): Promise<T> {
  try {
    const txt = await readFile(resolve(DATA_DIR, file), "utf8");
    return JSON.parse(txt) as T;
  } catch {
    return fallback;
  }
}

function dedupe(slug: string, existing: ExistingArticle[]): string {
  if (!existing.some((a) => a.slug === slug)) return slug;
  for (let i = 2; i < 50; i++) if (!existing.some((a) => a.slug === `${slug}-${i}`)) return `${slug}-${i}`;
  return `${slug}-${Date.now()}`;
}

function pruneOld(items: ExistingArticle[]): ExistingArticle[] {
  const cutoff = Date.now() - ROLL_DAYS * 86_400_000;
  return items.filter((a) => {
    const t = new Date(a.publishedAt).getTime();
    return Number.isFinite(t) && t > cutoff;
  });
}

// Backfill mode — write one full editorial for every current news item, so
// clicking any headline lands on a real article (not a stub synthesised from
// the summary). Merges the freshly-written articles into the existing rolling
// archive so older pieces don't get wiped on the next 6h cycle.
const BACKFILL_SYSTEM = `You are the staff writer for an Indian-badminton-only news site. The user gives you a list of news headlines. For EACH headline, write one editorial (300–500 words). Voice: warm, knowledgeable, like The Athletic — never breathless or jingoistic.

Hard rules:
- Produce EXACTLY one article per input news item, in the same order. Output array length must equal the input array length.
- Each article must be substantive (300+ words). No filler, no hedging like "this article will explore". Just write the piece.
- Use the headline as the title (you may rephrase slightly for elegance, but keep the meaning).
- "body" is markdown. Short paragraphs. Allowed: paragraphs, **bold**, em-dashes. No h1/h2.
- "kicker" matches the input news kicker if it's one of: Match Report, Preview, Feature, Domestic, Ranking, Opinion, Result. Otherwise default to "Feature".
- "dek" is a 1–2 sentence subtitle that hooks the reader. Different from the title.
- "indianAngle" — single hook sentence on what's at stake for an Indian fan.
- "slug" must match the input news item's slug verbatim.
- "heroPlayerSlug": choose ONE if the piece focuses on a single player/pair. Valid slugs: satwik-chirag, lakshya-sen, pv-sindhu, treesa-gayatri, hs-prannoy, malvika-bansod. Omit if the piece is general.
- "publishedAt": ISO 8601 with +05:30 offset (IST). Use today's date.
- "readMinutes": honest estimate (200 words ≈ 1 min).
- "tags": short kebab-case strings (player slugs + event slugs).`;

export async function runArticleBackfill(): Promise<void> {
  const todayIso = new Date().toISOString();
  const today = todayIso.slice(0, 10);
  const news = await readJsonSafe<Array<{ slug: string; title: string; kicker: string; summary?: string; indian_angle?: string }>>("news.json", []);
  if (!Array.isArray(news) || news.length === 0) throw new Error("news.json is empty — run news job first.");

  const [players, existing] = await Promise.all([
    readJsonSafe<unknown[]>("players.json", []),
    readJsonSafe<ExistingArticle[]>("articles.json", []),
  ]);

  // Skip headlines that already have a fresh-enough article on disk. Saves
  // Gemini tokens and avoids needlessly rewriting prose that hasn't aged.
  const REFRESH_AFTER_HOURS = 18;
  const freshCutoff = Date.now() - REFRESH_AFTER_HOURS * 3600 * 1000;
  const haveFresh = new Set(
    existing
      .filter((a) => Number.isFinite(new Date(a.publishedAt).getTime()) && new Date(a.publishedAt).getTime() > freshCutoff)
      .map((a) => a.slug)
  );
  const needWriting = news.filter((n) => !haveFresh.has(slugify(n.slug, { lower: true, strict: true })));

  if (needWriting.length === 0) {
    console.log(`[articles-all] all ${news.length} headlines have a fresh article (<${REFRESH_AFTER_HOURS}h old) — nothing to write`);
    return;
  }

  const prompt = `Today is ${today}. Write one full editorial for each news item below — ${needWriting.length} articles total, in the same order.

### News items
${JSON.stringify(needWriting, null, 2)}

### Known Indian players (use these slugs verbatim for heroPlayerSlug + tags)
${JSON.stringify(players, null, 2)}`;

  console.log(`[articles-all] asking Gemini to write ${needWriting.length} of ${news.length} articles (${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: BACKFILL_SYSTEM, prompt, responseSchema: articlesResponseSchema });
  const parsed = ArticlesPayload.parse(raw);

  if (parsed.articles.length === 0) throw new Error("Gemini returned 0 articles");

  // Normalise slugs against the news items we asked Gemini to write about.
  const fresh: ExistingArticle[] = parsed.articles.map((a, i) => {
    const inputSlug = needWriting[i]?.slug;
    const slug = inputSlug ? slugify(inputSlug, { lower: true, strict: true }) : slugify(a.slug || a.title, { lower: true, strict: true });
    return { ...a, slug, publishedAt: a.publishedAt || todayIso };
  });

  // Merge: fresh articles take precedence over same-slug older ones; everything
  // else inside the rolling window is preserved. Older items past ROLL_DAYS
  // are dropped (the daily `article` job uses the same window).
  const freshSlugs = new Set(fresh.map((a) => a.slug));
  const carried = pruneOld(existing).filter((a) => !freshSlugs.has(a.slug));
  const merged = [...fresh, ...carried];

  await writeFile(resolve(DATA_DIR, "articles.json"), JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`[articles-all] wrote ${fresh.length} new article(s); ${merged.length} total in rolling ${ROLL_DAYS}-day window`);
}

export async function runArticle(): Promise<void> {
  const todayIso = new Date().toISOString();
  const today = todayIso.slice(0, 10);

  const [news, rankings, players, existing] = await Promise.all([
    readJsonSafe<unknown[]>("news.json", []),
    readJsonSafe<unknown[]>("rankings.json", []),
    readJsonSafe<unknown[]>("players.json", []),
    readJsonSafe<ExistingArticle[]>("articles.json", []),
  ]);

  if (!Array.isArray(news) || news.length === 0) {
    throw new Error("No news.json content to draw from — run the news job first.");
  }

  const prompt = `Today is ${today}. Write 1–2 editorial pieces from the source data below. Pick whichever angle is strongest given the news.

### Today's news headlines
${JSON.stringify(news, null, 2)}

### Indian players (use the slugs verbatim for heroPlayerSlug + tags)
${JSON.stringify(players, null, 2)}

### Latest India in BWF rankings
${JSON.stringify(rankings, null, 2)}`;

  console.log(`[article] asking Gemini (${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: articlesResponseSchema });
  const parsed = ArticlesPayload.parse(raw);

  // Normalise slugs, dedupe against existing.
  const todays: ExistingArticle[] = [];
  for (const a of parsed.articles) {
    const baseSlug = slugify(a.slug || a.title, { lower: true, strict: true }).slice(0, 60);
    const slug = dedupe(baseSlug, [...existing, ...todays]);
    todays.push({ ...a, slug, publishedAt: a.publishedAt || todayIso });
  }

  const merged = [...todays, ...pruneOld(existing)];
  await writeFile(resolve(DATA_DIR, "articles.json"), JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`[article] wrote ${todays.length} new article(s); ${merged.length} total in rolling ${ROLL_DAYS}-day window`);
}
