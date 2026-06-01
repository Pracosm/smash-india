import "dotenv/config";
import { runNews } from "./jobs/news.ts";
import { runRankings } from "./jobs/rankings.ts";
import { runSchedule } from "./jobs/schedule.ts";
import { runMatches } from "./jobs/matches.ts";
import { runArticle, runArticleBackfill } from "./jobs/article.ts";

const JOBS: Record<string, () => Promise<void>> = {
  news: runNews,
  rankings: runRankings,
  schedule: runSchedule,
  matches: runMatches,
  article: runArticle,
  "articles-all": runArticleBackfill,
};

// `all` runs the scrape jobs but NOT the article job (which costs more LLM
// tokens and is scheduled separately, once a day).
// `matches` is intentionally NOT in ALL — the home UI doesn't render match
// data anymore (no real live source). The job stays available for future use.
const ALL = ["news", "rankings", "schedule"];

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const which = args[0] ?? "all";
  const names = which === "all" ? ALL : [which];

  let failed = 0;
  for (const name of names) {
    const fn = JOBS[name];
    if (!fn) {
      console.error(`unknown job: ${name}. Available: ${Object.keys(JOBS).join(", ")}, all`);
      process.exit(2);
    }
    try {
      const t = Date.now();
      await fn();
      console.log(`[${name}] ✓ ${(Date.now() - t) / 1000}s`);
    } catch (err) {
      failed++;
      console.error(`[${name}] ✗`, err instanceof Error ? err.message : err);
    }
  }
  if (failed > 0) {
    console.error(`${failed}/${names.length} job(s) failed — last-good JSON left in place`);
    process.exit(1);
  }
}

main();
