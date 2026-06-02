// Build-time RSS feed generator. Reads public/data/articles.json (the
// long-form AI-written editorials, refreshed on every news cron) and writes
// dist/rss.xml. Plugged into `npm run build` as a postbuild step.
//
// The feed is the single source of truth that a no-code relay (Buffer /
// Make / IFTTT / Zapier) watches to auto-post new articles to X.

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

// Update this when the site moves to a custom domain.
const SITE_URL = "https://smash-india.shardulnandedkar05.workers.dev";
const SITE_TITLE = "SMASH India";
const SITE_DESCRIPTION = "Indian-angle stories on world badminton — match reports, previews, opinions. AI-written, human-curated, refreshed every six hours.";

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s) {
  // Escape any closing ]]> sequence inside the body
  return `<![CDATA[${String(s ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function markdownToHtml(md) {
  // Very tiny markdown → HTML — paragraphs + **bold** + line breaks.
  // The body is short markdown from Gemini; full mdx isn't worth bundling here.
  return String(md ?? "")
    .split(/\n{2,}/)
    .map((para) => "<p>" + para.trim().replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") + "</p>")
    .join("\n");
}

async function main() {
  const articlesPath = resolve(ROOT, "public/data/articles.json");
  const distPath = resolve(ROOT, "dist/rss.xml");
  const publicCopyPath = resolve(ROOT, "public/rss.xml"); // also drop in /public so dev server serves it

  let articles = [];
  try {
    articles = JSON.parse(await readFile(articlesPath, "utf8"));
  } catch (err) {
    console.warn(`[rss] articles.json not readable, emitting empty feed (${err.message})`);
  }

  // Newest first (the data file already is, but be defensive).
  articles.sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0));

  const buildDate = new Date().toUTCString();
  const items = articles.slice(0, 30).map((a) => {
    const link = `${SITE_URL}/news/${a.slug}`;
    const pub = a.publishedAt ? new Date(a.publishedAt).toUTCString() : buildDate;
    const desc = a.dek || a.indianAngle || "";
    const body = markdownToHtml(a.body);
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pub}</pubDate>
      <category>${escapeXml(a.kicker ?? "Feature")}</category>
      <description>${cdata(desc)}</description>
      <content:encoded>${cdata(body)}</content:encoded>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-IN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  await writeFile(distPath, xml, "utf8").catch(() => {}); // dist/ may not exist on dev runs
  await writeFile(publicCopyPath, xml, "utf8");
  console.log(`[rss] wrote ${articles.length} items → dist/rss.xml + public/rss.xml`);
}

main().catch((err) => {
  console.error("[rss]", err);
  process.exit(1);
});
