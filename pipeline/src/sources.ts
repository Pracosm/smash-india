export type SourceKind = "html" | "rss";

export interface Source {
  url: string;
  kind: SourceKind;
  label: string;
}

// News — clipped HTML pages and RSS feeds we extract Indian-badminton stories from.
// Keep this list tight: ~5–10 pages is plenty for Gemini's free tier.
export const NEWS_SOURCES: Source[] = [
  { url: "https://www.badmintonindia.org/news",                          kind: "html", label: "BAI press releases" },
  { url: "https://sportstar.thehindu.com/feeder/default.rss",            kind: "rss",  label: "Sportstar (filter badminton in prompt)" },
  { url: "https://indianexpress.com/section/sports/badminton/feed/",     kind: "rss",  label: "Indian Express — badminton" },
  { url: "https://www.thehindu.com/sport/feeder/default.rss",            kind: "rss",  label: "The Hindu sport" },
  { url: "https://www.hindustantimes.com/feeds/rss/sports/badminton/rssfeed.xml", kind: "rss", label: "Hindustan Times — badminton" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719161.cms",     kind: "rss",  label: "Times of India sport" },
];

// Match sources — only badminton-scoped feeds. The Hindu sport / Sportstar
// default feeds mix all sports and Gemini will hallucinate cricket/tennis
// matches. Do not add general "sport" feeds here without a hard filter.
export const MATCH_SOURCES: Source[] = [
  { url: "https://indianexpress.com/section/sports/badminton/feed/",     kind: "rss",  label: "Indian Express — badminton" },
  { url: "https://www.hindustantimes.com/feeds/rss/sports/badminton/rssfeed.xml", kind: "rss", label: "Hindustan Times — badminton" },
];

// Rankings — Wikipedia maintains a single page with current ranking tables for
// all five disciplines, refreshed in step with BWF's official rankings.
// We previously scraped bwfbadminton.com/rankings/2/... but those paths now
// 404 and the rest of bwfbadminton.com is Cloudflare-blocked to bots, so
// Wikipedia is the most reliable public source.
export const RANKINGS_SOURCES: Source[] = [
  { url: "https://en.wikipedia.org/wiki/BWF_World_Ranking", kind: "html", label: "Wikipedia BWF World Ranking" },
];

// Schedule — Wikipedia maintains a year-by-year BWF World Tour page that lists
// every event with dates, host city, grade and prize money. BWF's own
// calendar is Cloudflare-blocked. We probe the current year + next year so
// the schedule rolls over cleanly around January.
const yr = new Date().getFullYear();
export const SCHEDULE_SOURCES: Source[] = [
  { url: `https://en.wikipedia.org/wiki/${yr}_BWF_World_Tour`,     kind: "html", label: `Wikipedia ${yr} BWF World Tour` },
  { url: `https://en.wikipedia.org/wiki/${yr + 1}_BWF_World_Tour`, kind: "html", label: `Wikipedia ${yr + 1} BWF World Tour` },
];
