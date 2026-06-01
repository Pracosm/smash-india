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

// Rankings — BWF maintains one page per discipline. Gemini filters to Indian players.
export const RANKINGS_SOURCES: Source[] = [
  { url: "https://bwfbadminton.com/rankings/2/bwf-world-rankings/6/mens-singles",   kind: "html", label: "BWF MS" },
  { url: "https://bwfbadminton.com/rankings/2/bwf-world-rankings/7/womens-singles", kind: "html", label: "BWF WS" },
  { url: "https://bwfbadminton.com/rankings/2/bwf-world-rankings/8/mens-doubles",   kind: "html", label: "BWF MD" },
  { url: "https://bwfbadminton.com/rankings/2/bwf-world-rankings/9/womens-doubles", kind: "html", label: "BWF WD" },
  { url: "https://bwfbadminton.com/rankings/2/bwf-world-rankings/10/mixed-doubles", kind: "html", label: "BWF XD" },
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
