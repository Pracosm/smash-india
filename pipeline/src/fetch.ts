import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import type { Source } from "./sources.ts";

const UA = "smash-india-bot/0.1 (+https://github.com/) - Indian badminton aggregator";

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

// Extract clean-ish text from an HTML page. Drops scripts/styles/nav chrome,
// returns a markdown-ish stream Gemini can read easily.
export function htmlToText(html: string): string {
  const $ = load(html);
  $("script, style, noscript, svg, iframe, link, meta, header nav, footer nav").remove();

  // Hand-rolled, deliberately dumb: every headline/anchor/li becomes one line.
  const chunks: string[] = [];
  $("h1, h2, h3, h4, a, li, p, time, span.date, td").each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (!text) return;
    if (text.length < 3 || text.length > 320) return;
    chunks.push(text);
  });
  // De-dup adjacent repeats (BWF templates duplicate a lot).
  const out: string[] = [];
  for (const line of chunks) if (line !== out[out.length - 1]) out.push(line);
  return out.join("\n");
}

const rssParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });

interface RssItem { title: string; link: string; pubDate?: string; description?: string }

export function rssToItems(xml: string): RssItem[] {
  const parsed = rssParser.parse(xml);
  // Standard RSS 2.0 vs Atom — we only need the simple case.
  const items = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
  const list = Array.isArray(items) ? items : [items];
  return list.map((it: Record<string, unknown>) => ({
    title: String(it.title ?? "").trim(),
    link: String(it.link ?? "").trim(),
    pubDate: it.pubDate ? String(it.pubDate) : it.published ? String(it.published) : undefined,
    description: it.description ? String(it.description) : it.summary ? String(it.summary) : undefined,
  })).filter((it) => it.title);
}

export interface FetchedSource {
  label: string;
  url: string;
  text: string; // serialised for Gemini
}

export async function fetchSource(s: Source): Promise<FetchedSource> {
  const body = await getText(s.url);
  if (s.kind === "rss") {
    const items = rssToItems(body);
    const text = items
      .slice(0, 25)
      .map((it) => `• ${it.title}${it.pubDate ? ` (${it.pubDate})` : ""}\n  ${it.description ?? ""}\n  ${it.link}`)
      .join("\n");
    return { label: s.label, url: s.url, text };
  }
  return { label: s.label, url: s.url, text: htmlToText(body) };
}

export async function fetchAll(sources: Source[]): Promise<FetchedSource[]> {
  const results = await Promise.allSettled(sources.map(fetchSource));
  const out: FetchedSource[] = [];
  for (const [i, r] of results.entries()) {
    const s = sources[i]!;
    if (r.status === "fulfilled") {
      out.push(r.value);
    } else {
      console.warn(`[fetch] ${s.label} (${s.url}) failed: ${r.reason}`);
    }
  }
  return out;
}

export function bundleForPrompt(fetched: FetchedSource[], maxCharsPerSource = 6000): string {
  return fetched
    .map((f) => `### SOURCE: ${f.label}\n(${f.url})\n\n${f.text.slice(0, maxCharsPerSource)}`)
    .join("\n\n---\n\n");
}
