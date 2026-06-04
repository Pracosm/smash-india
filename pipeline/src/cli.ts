import "dotenv/config";
import { runNews } from "./jobs/news.ts";
import { runRankings } from "./jobs/rankings.ts";
import { runSchedule } from "./jobs/schedule.ts";
import { runMatches } from "./jobs/matches.ts";
import { runProfiles } from "./jobs/profiles.ts";
import { runFeatured } from "./jobs/featured.ts";
import { runArticle, runArticleBackfill } from "./jobs/article.ts";

const JOBS: Record<string, () => Promise<void>> = {
  news: runNews,
  rankings: runRankings,
  schedule: runSchedule,
  matches: runMatches,
  profiles: runProfiles,
  featured: runFeatured,
  article: runArticle,
  "articles-all": runArticleBackfill,
};

// Job groupings — the workflow scheduler runs ALL every 6 hours and DAILY
// once per day. The split exists so we stay under Gemini's free-tier daily
// quota: 6 × 4 calls/day for ALL + 4 calls/day for DAILY = 16/day, under 20.
//
// `all` covers the time-sensitive feeds. `matches` is intentionally NOT in
// ALL — the home UI doesn't render match data anymore (no real live source).
// `daily` covers data that changes on a tournament cadence (days, not hours):
// the calendar, player form/ranks/notes, and the featured-event storyline.
// Order in `daily` matters — profiles + featured read rankings.json, so
// `rankings` must run first if you invoke `daily` standalone.
const ALL = ["news", "rankings"];
const DAILY = ["rankings", "schedule", "profiles", "featured"];

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const which = args[0] ?? "all";
  const names = which === "all" ? ALL : which === "daily" ? DAILY : [which];

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
    // Only fail the run when every job failed. Partial success still commits
    // the jobs that worked, so a single dead source shouldn't email the owner.
    if (failed === names.length) process.exit(1);
  }
}

main();
