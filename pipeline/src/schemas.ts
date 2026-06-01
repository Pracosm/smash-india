import { z } from "zod";

// All shapes mirror what src/data/broadcast.js consumes. Extra AI-only fields
// (importance_score, indian_angle, summary) ride along on news items —
// the React side ignores unknowns today and can use them later.

export const NewsItem = z.object({
  slug: z.string().min(4).max(80),          // kebab-case, unique
  kicker: z.string().min(1).max(40),
  title: z.string().min(8).max(180),
  time: z.string().min(1).max(20),          // "3h ago" / "Yesterday" / "Jun 1"
  read: z.string().min(2).max(12),          // "4 min"
  importance_score: z.number().int().min(1).max(10).optional(),
  indian_angle: z.string().max(280).optional(),
  summary: z.string().max(420).optional(),
});

export const FreshResult = z.object({
  tag: z.string().min(1).max(20),
  event: z.string().min(3).max(80),
  discipline: z.string().min(3).max(80),
  winner: z.string().min(2).max(100),
  loser: z.string().min(2).max(100),
  score: z.string().min(3).max(60),
  when: z.string().min(2).max(20),
});

export const RankingEntry = z.object({
  disc: z.string().min(3).max(40),
  name: z.string().min(2).max(60),
  rank: z.number().int().min(1).max(500),
  move: z.enum(["up", "down", "same"]),
  pts: z.string().min(1).max(20),
});

export const ScheduleEntry = z.object({
  slug: z.string().min(3).max(60),          // kebab-case from name
  date: z.string().min(3).max(12),
  name: z.string().min(3).max(80),
  grade: z.string().min(3).max(40),
  city: z.string().min(2).max(60),
  flag: z.string().min(1).max(8),
  soon: z.boolean(),
  bwfUrl: z.string().url().max(300).optional(),  // outbound to live BWF page
});

export const NextEvent = z.object({
  name: z.string().min(3).max(80),
  grade: z.string().min(3).max(60),
  city: z.string().min(2).max(60),
  venue: z.string().min(2).max(80),
  dates: z.string().min(5).max(60),
  startsAt: z.string().min(10).max(40),
  indiaInDraw: z.number().int().min(0).max(60),
  disciplines: z.number().int().min(1).max(5),
  blurb: z.string().min(20).max(400),
  broadcaster: z.string().min(2).max(80),
});

export const NewsPayload = z.object({
  news: z.array(NewsItem).min(3).max(8),
  freshResult: FreshResult,
});

export const RankingsPayload = z.object({
  rankings: z.array(RankingEntry).min(3).max(12),
});

export const SchedulePayload = z.object({
  schedule: z.array(ScheduleEntry).min(3).max(8),
  nextEvent: NextEvent,
});

// JSON Schemas passed to Gemini's `responseJsonSchema` field. Keep them
// in sync with the Zod shapes above when you edit either side.

const newsItemSchema = {
  type: "object",
  properties: {
    slug: { type: "string" },
    kicker: { type: "string" },
    title: { type: "string" },
    time: { type: "string" },
    read: { type: "string" },
    importance_score: { type: "integer", minimum: 1, maximum: 10 },
    indian_angle: { type: "string" },
    summary: { type: "string" },
  },
  required: ["slug", "kicker", "title", "time", "read"],
};

const freshResultSchema = {
  type: "object",
  properties: {
    tag: { type: "string" },
    event: { type: "string" },
    discipline: { type: "string" },
    winner: { type: "string" },
    loser: { type: "string" },
    score: { type: "string" },
    when: { type: "string" },
  },
  required: ["tag", "event", "discipline", "winner", "loser", "score", "when"],
};

const rankingEntrySchema = {
  type: "object",
  properties: {
    disc: { type: "string" },
    name: { type: "string" },
    rank: { type: "integer" },
    move: { type: "string", enum: ["up", "down", "same"] },
    pts: { type: "string" },
  },
  required: ["disc", "name", "rank", "move", "pts"],
};

const scheduleEntrySchema = {
  type: "object",
  properties: {
    slug: { type: "string" },
    date: { type: "string" },
    name: { type: "string" },
    grade: { type: "string" },
    city: { type: "string" },
    flag: { type: "string" },
    soon: { type: "boolean" },
    bwfUrl: { type: "string" },
  },
  required: ["slug", "date", "name", "grade", "city", "flag", "soon"],
};

const nextEventSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    grade: { type: "string" },
    city: { type: "string" },
    venue: { type: "string" },
    dates: { type: "string" },
    startsAt: { type: "string" },
    indiaInDraw: { type: "integer" },
    disciplines: { type: "integer" },
    blurb: { type: "string" },
    broadcaster: { type: "string" },
  },
  required: ["name", "grade", "city", "venue", "dates", "startsAt", "indiaInDraw", "disciplines", "blurb", "broadcaster"],
};

export const newsResponseSchema = {
  type: "object",
  properties: {
    news: { type: "array", items: newsItemSchema, minItems: 3, maxItems: 8 },
    freshResult: freshResultSchema,
  },
  required: ["news", "freshResult"],
};

export const rankingsResponseSchema = {
  type: "object",
  properties: {
    rankings: { type: "array", items: rankingEntrySchema, minItems: 3, maxItems: 12 },
  },
  required: ["rankings"],
};

export const scheduleResponseSchema = {
  type: "object",
  properties: {
    schedule: { type: "array", items: scheduleEntrySchema, minItems: 3, maxItems: 8 },
    nextEvent: nextEventSchema,
  },
  required: ["schedule", "nextEvent"],
};

// ─── Matches (today's schedule + recent results) ────────────────────────────

// disc must start with a badminton discipline code so we drop hallucinated
// cricket / tennis / hockey matches even if Gemini sneaks them past the prompt.
const BADMINTON_DISC = /^(MS|WS|MD|WD|XD)\b/;

export const TodayMatch = z.object({
  time: z.string().min(3).max(8),             // "13:10" (IST 24h)
  disc: z.string().min(3).max(20).regex(BADMINTON_DISC, "not a badminton discipline"),
  event: z.string().min(3).max(60),
  a: z.string().min(2).max(60),
  ac: z.string().length(3),
  b: z.string().min(2).max(60),
  bc: z.string().length(3),
  court: z.string().min(3).max(30).optional(),
});

export const RecentMatch = z.object({
  disc: z.string().min(3).max(20).regex(BADMINTON_DISC, "not a badminton discipline"),
  event: z.string().min(3).max(60),
  a: z.string().min(2).max(60),
  ac: z.string().length(3),
  b: z.string().min(2).max(60),
  bc: z.string().length(3),
  s: z.string().min(3).max(60),               // "21–18, 21–16"
  win: z.enum(["a", "b"]),
  when: z.string().min(2).max(20),
});

export const MatchesPayload = z.object({
  today:  z.array(TodayMatch).max(8),
  recent: z.array(RecentMatch).max(8),
});

const todayMatchSchema = {
  type: "object",
  properties: {
    time: { type: "string" },
    disc: { type: "string" },
    event: { type: "string" },
    a: { type: "string" },
    ac: { type: "string" },
    b: { type: "string" },
    bc: { type: "string" },
    court: { type: "string" },
  },
  required: ["time", "disc", "event", "a", "ac", "b", "bc"],
};

const recentMatchSchema = {
  type: "object",
  properties: {
    disc: { type: "string" },
    event: { type: "string" },
    a: { type: "string" },
    ac: { type: "string" },
    b: { type: "string" },
    bc: { type: "string" },
    s: { type: "string" },
    win: { type: "string", enum: ["a", "b"] },
    when: { type: "string" },
  },
  required: ["disc", "event", "a", "ac", "b", "bc", "s", "win", "when"],
};

export const matchesResponseSchema = {
  type: "object",
  properties: {
    today:  { type: "array", items: todayMatchSchema, maxItems: 8 },
    recent: { type: "array", items: recentMatchSchema, maxItems: 8 },
  },
  required: ["today", "recent"],
};

// ─── Articles (daily AI-written editorials) ─────────────────────────────────

export const Article = z.object({
  slug: z.string().min(4).max(80),
  kicker: z.string().min(2).max(40),        // Daily Brief | Feature | Preview | Match Report | Opinion
  title: z.string().min(8).max(140),
  dek: z.string().min(20).max(280),         // 1–2 sentence subtitle
  body: z.string().min(300).max(4000),      // markdown 300–500 words
  heroPlayerSlug: z.string().max(60).optional(),  // links to public/data/players.json
  publishedAt: z.string().min(10).max(40),  // ISO with offset
  indianAngle: z.string().min(20).max(280),
  readMinutes: z.number().int().min(1).max(20),
  tags: z.array(z.string()).max(8),
});

export const ArticlesPayload = z.object({
  articles: z.array(Article).min(1).max(8),
});

const articleSchema = {
  type: "object",
  properties: {
    slug: { type: "string" },
    kicker: { type: "string" },
    title: { type: "string" },
    dek: { type: "string" },
    body: { type: "string" },
    heroPlayerSlug: { type: "string" },
    publishedAt: { type: "string" },
    indianAngle: { type: "string" },
    readMinutes: { type: "integer" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["slug", "kicker", "title", "dek", "body", "publishedAt", "indianAngle", "readMinutes", "tags"],
};

export const articlesResponseSchema = {
  type: "object",
  properties: {
    articles: { type: "array", items: articleSchema, minItems: 1, maxItems: 8 },
  },
  required: ["articles"],
};
