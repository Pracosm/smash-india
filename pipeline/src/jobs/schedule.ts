import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll, bundleForPrompt } from "../fetch.ts";
import { geminiJSON } from "../gemini.ts";
import { SCHEDULE_SOURCES } from "../sources.ts";
import { SchedulePayload, scheduleResponseSchema } from "../schemas.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../public/data");

const SYSTEM = `You read Wikipedia's "<year> BWF World Tour" article — a calendar of every event for the year. Produce TWO things:

**HARD DATE RULE — read carefully.** The user gives you "today's date" at the top of the prompt. You must ONLY return tournaments whose start date is on or AFTER that date. NEVER include events that have already happened, even if they appear at the top of the Wikipedia article. The calendar runs chronologically from January, so January–April events for 2026 are LIKELY ALREADY OVER if today is in May or later. Skip them.

If fewer than 5 upcoming events exist in the source, return fewer entries. Don't pad with past ones.

1. "schedule": the next 5 marquee tournaments starting from today, sorted by date ascending. Field rules:
   - "slug": kebab-case from the tournament name ("indonesia-open", "world-championships")
   - "date": short uppercase form like "JUN 02"
   - "name": short tournament name ("Indonesia Open", "World Championships")
   - "grade": the BWF grade ("Super 1000", "Super 750", "Super 500", "Super 300", or "BWF Worlds" / "BWF Finals" for non-Super events)
   - "city": host city
   - "flag": single emoji flag of the host country (🇮🇳 🇮🇩 🇺🇸 🇨🇳 🇯🇵 🇩🇰 🇲🇾 🇰🇷 🇹🇭 🇫🇷 🇪🇸 🇩🇪 🇬🇧 🇨🇦 🇸🇬 etc.)
   - "soon": true only for the first/next upcoming tournament, false for the rest
   - "bwfUrl": a URL to the BWF page for the event. PREFER a real bwfbadminton.com tournament URL if one is mentioned in the source (e.g. "https://bwfworldtour.bwfbadminton.com/tournament/<id>/<slug>/"). If you don't have a verified URL, fall back to a search URL: "https://bwfbadminton.com/?s=<tournament+name+with+plus+signs>". The fallback must be a valid URL.

2. "nextEvent": more detail on that first tournament. Field rules:
   - "name", "grade", "city", "venue" (e.g. "Istora Senayan"), "dates" ("Jun 2 – Jun 7, 2026")
   - "startsAt": full ISO timestamp with local timezone offset (used as a countdown target)
   - "indiaInDraw": estimated number of Indian players/pairs in the main draw across disciplines (best guess if not stated; default 8)
   - "disciplines": always 5
   - "blurb": 1–2 punchy sentences on what's at stake for India
   - "broadcaster": comma-separated channels likely to air it in India ("Sony Sports · JioHotstar")`;

export async function runSchedule(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[schedule] fetching ${SCHEDULE_SOURCES.length} sources…`);
  const fetched = await fetchAll(SCHEDULE_SOURCES);
  if (fetched.length === 0) throw new Error("No schedule sources reachable");

  const now = new Date();
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth(); // 0-indexed
  const prompt = `TODAY IS ${today}. The current month is ${MONTHS[nowMonth]} ${nowYear}. Extract the next 5 upcoming BWF tournaments from the calendar text below — every event you return must have a start date on or after today. Tournaments earlier in ${nowYear} have already happened; do not include them.\n\n${bundleForPrompt(fetched, 10000)}`;
  console.log(`[schedule] asking Gemini (${fetched.length} sources, ${prompt.length} chars)…`);
  const raw = await geminiJSON<unknown>({ systemInstruction: SYSTEM, prompt, responseSchema: scheduleResponseSchema });
  const parsed = SchedulePayload.parse(raw);

  // Safety net — drop entries whose date is plainly in the past, regardless of
  // what Gemini said. Parse "JAN 13" / "JUN 02" → month index.
  const isFuture = (d: string): boolean => {
    const m = MONTH_FROM_PREFIX[d.slice(0, 3).toUpperCase()];
    const day = parseInt(d.slice(4).trim(), 10);
    if (m == null || !Number.isFinite(day)) return true; // unknown → keep
    if (m > nowMonth) return true;
    if (m < nowMonth) return false;
    return day >= now.getUTCDate() - 1; // give 1 day grace for in-progress events
  };

  const filtered = parsed.schedule.filter((e) => isFuture(e.date));
  if (filtered.length === 0) {
    console.log("[schedule] all entries were in the past — keeping last-good schedule.json");
  } else {
    if (filtered.length < parsed.schedule.length) {
      console.log(`[schedule] dropped ${parsed.schedule.length - filtered.length} past entr${parsed.schedule.length - filtered.length === 1 ? "y" : "ies"}`);
    }
    // Ensure exactly one entry is flagged `soon` — the earliest future one.
    filtered.sort((a, b) => indexOfDate(a.date) - indexOfDate(b.date));
    filtered.forEach((e, i) => { e.soon = i === 0; });
    await writeFile(resolve(DATA_DIR, "schedule.json"), JSON.stringify(filtered, null, 2) + "\n", "utf8");
    console.log(`[schedule] wrote ${filtered.length} upcoming entries`);
  }

  // Only write nextEvent if its start time is actually in the future.
  const nextStart = new Date(parsed.nextEvent.startsAt).getTime();
  if (Number.isFinite(nextStart) && nextStart > now.getTime() - 86_400_000) {
    await writeFile(resolve(DATA_DIR, "next-event.json"), JSON.stringify(parsed.nextEvent, null, 2) + "\n", "utf8");
    console.log("[schedule] wrote nextEvent");
  } else {
    console.log(`[schedule] nextEvent.startsAt (${parsed.nextEvent.startsAt}) is in the past — keeping last-good next-event.json`);
  }
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_FROM_PREFIX: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};
function indexOfDate(d: string): number {
  const m = MONTH_FROM_PREFIX[d.slice(0, 3).toUpperCase()] ?? 0;
  const day = parseInt(d.slice(4).trim(), 10) || 0;
  return m * 31 + day;
}
