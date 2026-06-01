// Canonical BWF tournament URLs for the 2026 calendar.
// Source: pasted by the user (October 2025) — these are the deep links
// the pipeline assigns based on the slug Gemini produces for each event.
//
// Slug = kebab-case short form of the tournament name (e.g. "indonesia-open",
// "all-england-open"). Aliases below map common variant slugs to canonicals.

export const BWF_TOUR_URLS: Record<string, string> = {
  "malaysia-open":      "https://bwfworldtour.bwfbadminton.com/tournament/5227/petronas-malaysia-open-2026/results/",
  "india-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5269/yonex-sunrise-india-open-2026/results/",
  "indonesia-masters":  "https://bwfworldtour.bwfbadminton.com/tournament/5529/daihatsu-indonesia-masters-2026/results/",
  "thailand-masters":   "https://bwfworldtour.bwfbadminton.com/tournament/5226/princess-sirivannavari-thailand-masters-2026/results/",
  "german-open":        "https://bwfworldtour.bwfbadminton.com/tournament/5246/yonex-german-open-2026/results/",
  "all-england-open":   "https://bwfworldtour.bwfbadminton.com/tournament/5515/yonex-all-england-open-badminton-championships-2026/results/",
  "swiss-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5247/yonex-swiss-open-2026/results/",
  "orleans-masters":    "https://bwfworldtour.bwfbadminton.com/tournament/5270/orleans-masters-badminton-2026-presented-by-victor/results/",
  "thailand-open":      "https://bwfworldtour.bwfbadminton.com/tournament/5230/toyota-thailand-open-2026/results/",
  "malaysia-masters":   "https://bwfworldtour.bwfbadminton.com/tournament/5229/perodua-malaysia-masters-2026/results/",
  "singapore-open":     "https://bwfworldtour.bwfbadminton.com/tournament/5649/kff-singapore-badminton-open-2026/results/",
  "indonesia-open":     "https://bwfworldtour.bwfbadminton.com/tournament/5528/polytron-indonesia-open-2026/results/",
  "australian-open":    "https://bwfworldtour.bwfbadminton.com/tournament/5215/sathio-group-australian-badminton-open-2026/results/",
  "macau-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5214/sands-china-ltd-macau-open-2026/results/",
  "us-open":            "https://bwfworldtour.bwfbadminton.com/tournament/5272/yonex-us-open-2026/results/",
  "canada-open":        "https://bwfworldtour.bwfbadminton.com/tournament/5271/yonex-canada-open-2026/results/",
  "japan-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5213/daihatsu-japan-open-2026/results/",
  "china-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5622/victor-china-open-2026/results/",
  "taipei-open":        "https://bwfworldtour.bwfbadminton.com/tournament/5514/yonex-taipei-open-2026/results/",
  "korea-masters":      "https://bwfworldtour.bwfbadminton.com/tournament/5596/victor-korea-masters-2026/results/",
  "china-masters":      "https://bwfworldtour.bwfbadminton.com/tournament/5625/china-masters-2026/results/",
  "arctic-open":        "https://bwfworldtour.bwfbadminton.com/tournament/5594/arctic-open-2026-powered-by-yonex/results/",
  "denmark-open":       "https://bwfworldtour.bwfbadminton.com/tournament/5210/victor-denmark-open-2026/results/",
  "french-open":        "https://bwfworldtour.bwfbadminton.com/tournament/5211/yonex-french-open-2026/results/",
  "hylo-open":          "https://bwfworldtour.bwfbadminton.com/tournament/5273/hylo-open-2026/results/",
  "korea-open":         "https://bwfworldtour.bwfbadminton.com/tournament/5597/korea-open-2026/results/",
  "kumamoto-masters":   "https://bwfworldtour.bwfbadminton.com/tournament/5216/kumamoto-masters-japan-2026/results/",
  "hong-kong-open":     "https://bwfworldtour.bwfbadminton.com/tournament/5218/hong-kong-open-2026/results/",
  "syed-modi":          "https://bwfworldtour.bwfbadminton.com/tournament/5274/syed-modi-india-international-2026/results/",
  // Year-end Tour Finals lives on a different subdomain.
  "world-tour-finals":  "https://bwfworldtourfinals.bwfbadminton.com/results/5602/hsbc-bwf-world-tour-finals-2026",
};

// Slugs Gemini commonly produces that need normalising to canonical keys above.
const SLUG_ALIASES: Record<string, string> = {
  "u-s-open":                       "us-open",
  "u.s.-open":                      "us-open",
  "u.s-open":                       "us-open",
  "yonex-us-open":                  "us-open",
  "all-england":                    "all-england-open",
  "all-england-championships":      "all-england-open",
  "all-england-badminton-championships": "all-england-open",
  "syed-modi-india-international":  "syed-modi",
  "syed-modi-international":        "syed-modi",
  "indonesia-open-super-1000":      "indonesia-open",
  "indonesia-masters-super-500":    "indonesia-masters",
  "world-tour-finals-2026":         "world-tour-finals",
  "bwf-world-tour-finals":          "world-tour-finals",
  "tour-finals":                    "world-tour-finals",
  "kumamoto-masters-japan":         "kumamoto-masters",
};

// Resolve a Gemini-produced slug to a real BWF tournament URL. Returns
// the canonical World Tour calendar URL if we don't have a match — that
// always works as a landing page even though it isn't a deep link.
export const BWF_CALENDAR_URL = "https://bwfworldtour.bwfbadminton.com/calendar/";

export function bwfUrlFor(slug: string): string {
  const normalised = (SLUG_ALIASES[slug] ?? slug).toLowerCase();
  return BWF_TOUR_URLS[normalised] ?? BWF_CALENDAR_URL;
}
