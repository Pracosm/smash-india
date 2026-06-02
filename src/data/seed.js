// Last-known-good values shipped in the JS bundle. Used for first paint
// before the runtime fetch of /data/*.json returns. Pipeline output replaces
// these at runtime via usePolledJson; if a fetch fails, seed values remain.

import photoSatwik from "../assets/players/satwik.jpg";
import photoChirag from "../assets/players/chirag.jpg";
import photoLakshya from "../assets/players/lakshya.jpg";
import photoSindhu from "../assets/players/sindhu.jpg";
import photoTreesa from "../assets/players/treesa.jpg";
import photoGayatri from "../assets/players/gayatri.jpg";
import photoPrannoy from "../assets/players/prannoy.jpg";
import photoMalvika from "../assets/players/malvika.jpg";

// keyed by photo filename (matches public/data/players.json `photo` field)
export const PLAYER_PHOTOS = {
  "satwik.jpg":  photoSatwik,
  "chirag.jpg":  photoChirag,
  "lakshya.jpg": photoLakshya,
  "sindhu.jpg":  photoSindhu,
  "treesa.jpg":  photoTreesa,
  "gayatri.jpg": photoGayatri,
  "prannoy.jpg": photoPrannoy,
  "malvika.jpg": photoMalvika,
};

export const SEED_PLAYERS = [
  { slug: "satwik-chirag",  name: "Satwik & Chirag",  role: "Men's Doubles",   rank: 3,  form: ["W","W","W","W","L"], note: "Singapore champions",   hot: true, photo: "satwik.jpg",  pos: "center 25%", photo2: "chirag.jpg",  pos2: "center 25%", bio: "Satwiksairaj Rankireddy and Chirag Shetty — India's first-ever men's doubles pair to break into the BWF top 5." },
  { slug: "lakshya-sen",    name: "Lakshya Sen",      role: "Men's Singles",   rank: 12, form: ["W","L","W","W","W"], note: "5 SF in 7 events",       photo: "lakshya.jpg", pos: "center 20%", bio: "Lakshya Sen — All England finalist, Paris Olympics fourth-place." },
  { slug: "pv-sindhu",      name: "PV Sindhu",        role: "Women's Singles", rank: 15, form: ["L","W","W","L","W"], note: "Rebuilding the engine",  photo: "sindhu.jpg",  pos: "center 22%", bio: "Two-time Olympic medallist, World Championship gold (2019)." },
  { slug: "treesa-gayatri", name: "Treesa & Gayatri", role: "Women's Doubles", rank: 16, form: ["W","W","L","W","W"], note: "Career-high ranking",    photo: "treesa.jpg",  pos: "center 18%", photo2: "gayatri.jpg", pos2: "center 22%", bio: "India's most promising women's doubles pair in a decade." },
  { slug: "hs-prannoy",     name: "HS Prannoy",       role: "Men's Singles",   rank: 24, form: ["W","L","L","W","L"], note: "The veteran fighter",    photo: "prannoy.jpg", pos: "center 22%", bio: "Indian Open 2023 champion, World Championship bronze (2023)." },
  { slug: "malvika-bansod", name: "Malvika Bansod",   role: "Women's Singles", rank: 31, form: ["W","W","L","W","W"], note: "Climbing the ladder",    photo: "malvika.jpg", pos: "center 28%", bio: "Left-handed, deceptive, chipping away at the world top 30." },
];

export const SEED_NEWS = [
  { slug: "satwik-chirag-singapore-open-champions", kicker: "Match Report", title: "Satwik-Chirag Crowned Singapore Open Champions", time: "Yesterday", read: "4 min", importance_score: 10, indian_angle: "India's top men's doubles pair secured a Super 750 title.", summary: "Satwiksairaj Rankireddy and Chirag Shetty clinched the Singapore Open with a display of furious rallies and powerful smashes." },
  { slug: "satwik-dedicates-singapore-win",         kicker: "Feature",      title: "Satwik Dedicates Singapore Open Win to Newborn Niece", time: "Yesterday", read: "3 min", importance_score: 9, indian_angle: "An emotional dedication that resonated with Indian fans.", summary: "Following their Singapore triumph, Satwik shared a deeply personal dedication." },
  { slug: "sindhu-ready-for-bwf-tour-demands",      kicker: "Opinion",      title: "Is PV Sindhu Ready for the Demands of the BWF Tour?", time: "Yesterday", read: "3 min", importance_score: 6, indian_angle: "Critical examination of India's star shuttler's consistency.", summary: "Analysis questions Sindhu's current game and physical readiness for the BWF grind." },
  { slug: "india-hosts-bwf-world-championships-2026", kicker: "Preview", title: "India Prepares to Host BWF World Championships 2026", time: "1 month ago", read: "2 min", importance_score: 8, indian_angle: "New Delhi will host the prestigious event.", summary: "BAI invited bids and started a mascot competition for August 17–23 in New Delhi." },
];

export const SEED_FRESH_RESULT = {
  tag: "CHAMPIONS",
  event: "Singapore Open · Super 750",
  discipline: "Men's Doubles — Final",
  winner: "Satwik Rankireddy / Chirag Shetty",
  loser: "Liang / Wang",
  score: "21–18, 21–16",
  when: "Yesterday",
};

export const SEED_RANKINGS = [
  { disc: "Men's Doubles",   name: "Satwik & Chirag",  rank: 3,  move: "up",   pts: "92,540" },
  { disc: "Men's Singles",   name: "Lakshya Sen",      rank: 12, move: "up",   pts: "61,318" },
  { disc: "Women's Singles", name: "PV Sindhu",        rank: 15, move: "down", pts: "54,902" },
  { disc: "Women's Doubles", name: "Treesa & Gayatri", rank: 16, move: "up",   pts: "48,110" },
  { disc: "Men's Singles",   name: "HS Prannoy",       rank: 24, move: "down", pts: "39,760" },
  { disc: "Women's Singles", name: "Malvika Bansod",   rank: 31, move: "up",   pts: "31,205" },
];

export const SEED_SCHEDULE = [
  { slug: "indonesia-open",  date: "JUN 02", name: "Indonesia Open",   grade: "Super 1000", city: "Jakarta",    venue: "Istora Senayan",        dates: "Jun 2 – Jun 7, 2026",   country: "Indonesia",     flag: "🇮🇩", soon: true,  indiaInDraw: 9, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5528/polytron-indonesia-open-2026/results/" },
  { slug: "australian-open", date: "JUN 09", name: "Australian Open",  grade: "Super 500",  city: "Sydney",     venue: "Quaycentre",            dates: "Jun 9 – Jun 14, 2026",  country: "Australia",     flag: "🇦🇺", soon: false, indiaInDraw: 5, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5215/sathio-group-australian-badminton-open-2026/results/" },
  { slug: "macau-open",      date: "JUN 16", name: "Macau Open",       grade: "Super 300",  city: "Macau",      venue: "Macau East Asian Games Dome", dates: "Jun 16 – Jun 21, 2026", country: "Macau",   flag: "🇲🇴", soon: false, indiaInDraw: 4, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5214/sands-china-ltd-macau-open-2026/results/" },
  { slug: "us-open",         date: "JUN 23", name: "U.S. Open",        grade: "Super 300",  city: "Fort Worth", venue: "Fort Worth Convention Center", dates: "Jun 23 – Jun 28, 2026", country: "United States", flag: "🇺🇸", soon: false, indiaInDraw: 4, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5272/yonex-us-open-2026/results/" },
  { slug: "canada-open",     date: "JUN 30", name: "Canada Open",      grade: "Super 300",  city: "Calgary",    venue: "Markin MacPhail Centre", dates: "Jun 30 – Jul 5, 2026",  country: "Canada",        flag: "🇨🇦", soon: false, indiaInDraw: 6, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5271/yonex-canada-open-2026/results/" },
  { slug: "japan-open",      date: "JUL 14", name: "Japan Open",       grade: "Super 750",  city: "Tokyo",      venue: "Tokyo Metropolitan Gym",  dates: "Jul 14 – Jul 19, 2026", country: "Japan",         flag: "🇯🇵", soon: false, indiaInDraw: 8, bwfUrl: "https://bwfworldtour.bwfbadminton.com/tournament/5213/daihatsu-japan-open-2026/results/" },
];

export const SEED_NEXT_EVENT = {
  name: "Indonesia Open",
  grade: "BWF World Tour · Super 1000",
  city: "Jakarta",
  venue: "Istora Senayan",
  dates: "Jun 2 – Jun 7, 2026",
  startsAt: "2026-06-02T09:30:00+07:00",
  indiaInDraw: 9,
  disciplines: 5,
  blurb: "India's biggest week of the summer. Satwik–Chirag arrive as the form pair on tour, Lakshya headlines the singles draw, and Sindhu opens her road back.",
  broadcaster: "Sony Sports · JioHotstar",
};

export const SEED_LIVE = [
  { status: "LIVE", disc: "MS · R32", event: "Singapore Open", a: "Lakshya Sen",      ac: "IND", b: "Kunlavut V.",     bc: "THA", sa: ["19"],      sb: ["21","14"], note: "Game 2 · 21-14", lead: "b" },
  { status: "LIVE", disc: "WS · R32", event: "Singapore Open", a: "PV Sindhu",        ac: "IND", b: "Wang Zhi Yi",     bc: "CHN", sa: ["21","8"],  sb: ["16","5"],  note: "Game 2 · 8-5",   lead: "a" },
  { status: "LIVE", disc: "WD · R16", event: "Singapore Open", a: "Treesa / Gayatri", ac: "IND", b: "Kim / Kong",      bc: "KOR", sa: ["15"],      sb: ["12"],      note: "Game 1 · 15-12", lead: "a" },
];

export const SEED_TODAY = [
  { time: "13:10", disc: "MS · R16", event: "Singapore Open", a: "HS Prannoy",       ac: "IND", b: "Anders Antonsen",   bc: "DEN", court: "Court 1" },
  { time: "14:40", disc: "MD · R16", event: "Singapore Open", a: "Satwik / Chirag",  ac: "IND", b: "Astrup / Rasmussen",bc: "DEN", court: "Court 1" },
  { time: "16:20", disc: "WS · R16", event: "Singapore Open", a: "Malvika Bansod",   ac: "IND", b: "Akane Yamaguchi",   bc: "JPN", court: "Court 2" },
  { time: "18:00", disc: "XD · R16", event: "Singapore Open", a: "Dhruv / Tanisha",  ac: "IND", b: "Zheng / Huang",     bc: "CHN", court: "Court 3" },
];

export const SEED_RECENT = [
  { disc: "MD Final", event: "Singapore Open", a: "Satwik / Chirag",  ac: "IND", b: "Liang / Wang",  bc: "CHN", s: "21–18, 21–16", win: "a" },
  { disc: "WD QF",    event: "Singapore Open", a: "Treesa / Gayatri", ac: "IND", b: "Baek / Lee",    bc: "KOR", s: "21–17, 19–21, 21–15", win: "a" },
  { disc: "MS SF",    event: "Singapore Open", a: "HS Prannoy",       ac: "IND", b: "Shi Yu Qi",     bc: "CHN", s: "18–21, 16–21", win: "b" },
  { disc: "MS QF",    event: "Thailand Open",  a: "Lakshya Sen",      ac: "IND", b: "Lee Zii Jia",   bc: "MAS", s: "21–19, 21–17", win: "a" },
];

export const PHOTO_CREDITS = [
  { player: "Satwik",           by: "PMO India",               license: "GODL-India" },
  { player: "Chirag",           by: "PMO India",               license: "GODL-India" },
  { player: "Lakshya Sen",      by: "Sandro Halank",           license: "CC BY-SA 4.0" },
  { player: "PV Sindhu",        by: "PMO India",               license: "GODL-India" },
  { player: "Treesa",           by: "In Vitrio",               license: "CC BY-SA 4.0" },
  { player: "Gayatri",          by: "In Vitrio",               license: "CC BY-SA 4.0" },
  { player: "HS Prannoy",       by: "Nardisoero",              license: "CC BY-SA 4.0" },
  { player: "Malvika Bansod",   by: "BBC World Service India", license: "CC BY-SA 4.0" },
];
