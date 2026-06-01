# Smash India — Data Pipeline

Scrapes public badminton sources, feeds them to Gemini 2.5 Flash for structured extraction + an "Indian-angle" rewrite, and writes the result to `../src/data/*.json`. The Vite app imports those JSON files at build time.

```
Internet → scrape → Gemini → src/data/*.json → git commit → Vercel rebuild
```

## Setup (one time)

```bash
cd pipeline
npm install
cp .env.example .env
# put a Gemini key from https://aistudio.google.com/apikey into .env
```

## Run

```bash
npm run pipeline -- news        # → src/data/news.json + fresh-result.json
npm run pipeline -- rankings    # → src/data/rankings.json
npm run pipeline -- schedule    # → src/data/schedule.json + next-event.json
npm run pipeline -- all         # all of the above
```

Each job:
1. fetches the configured sources (HTML or RSS),
2. concatenates the raw text into a Gemini prompt with a JSON `responseSchema`,
3. validates the response against a Zod schema,
4. writes `../src/data/*.json` only if validation passes — last-good data stays put otherwise.

## CI

`.github/workflows/refresh-data.yml` runs `pipeline -- all` every 6 hours and commits any JSON changes back to the repo. Add `GEMINI_API_KEY` to repo secrets.

## Source list

See `src/sources.ts`. Edit there to add or swap sources.

## Known limitation: BWF is Cloudflare-protected

`bwfbadminton.com` and `bwfworldtour.bwfbadminton.com` return HTTP 403 to any plain `fetch`. This affects the **rankings** and **schedule** jobs, which depend on those sources.

The **news** job is unaffected — BAI, Sportstar (RSS), Indian Express (RSS) all work fine, and they're where most India-angle stories live anyway.

To unblock BWF, pick one:

- **Firecrawl JS SDK** (paid past 500 pages/mo free) — drop-in scraper that handles Cloudflare. Add as a fallback in `src/fetch.ts` when `getText` 403s.
- **Crawl4AI in a sibling Python job** (free, OSS) — runs Playwright under the hood. Triggered from the same GitHub Action, writes the same JSON files.
- **Playwright in this Node project** — heaviest dep, slowest CI, but stays in one toolchain.

Until then, `rankings.json` and `schedule.json` stay frozen at the seed values from `broadcast.js`. The site still renders them; they just don't refresh.
