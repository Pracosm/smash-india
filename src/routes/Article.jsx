import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_NEWS, SEED_PLAYERS, PLAYER_PHOTOS } from "../data/seed.js";

export function Article() {
  const { slug } = useParams();
  const { data: articles } = usePolledJson("/data/articles.json", { intervalMs: 120_000, seed: [] });
  const { data: news } = usePolledJson("/data/news.json", { intervalMs: 120_000, seed: SEED_NEWS });
  const { data: players } = usePolledJson("/data/players.json", { intervalMs: 300_000, seed: SEED_PLAYERS });

  // First try long-form articles, then fall back to a short news item rendered with its summary.
  const article = (articles || []).find((a) => a.slug === slug);
  const newsItem = !article && (news || []).find((n) => n.slug === slug);

  if (!article && !newsItem) {
    return (
      <>
        <PageHead crumb={[{ label: "Home", to: "/" }, { label: "News", to: "/news" }]} eyebrow="NOT FOUND" title="Article not found" dek="This story might have been removed, or the link is wrong." />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 0 96px" }}>
          <Link to="/news" className="bc-cta" style={{ fontFamily: "var(--bc-sans)", fontSize: 14, color: "var(--bc-sub)" }}>← Back to newsroom</Link>
        </div>
      </>
    );
  }

  const item = article || newsItem;
  const heroPlayer = article?.heroPlayerSlug && (players || []).find((p) => p.slug === article.heroPlayerSlug);
  const heroImg = heroPlayer && PLAYER_PHOTOS[heroPlayer.photo];

  // For news items without a real body, synthesise from summary + indian_angle.
  const body = article?.body
    || [item.indian_angle, item.summary && `\n\n${item.summary}`].filter(Boolean).join("");

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "News", to: "/news" }]}
        eyebrow={(item.kicker || "STORY").toUpperCase()}
        title={item.title}
        dek={item.dek || item.indian_angle}
      />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "36px 40px 96px" }}>
        {heroImg && (
          <div style={{ marginBottom: 28, borderRadius: 10, overflow: "hidden", border: "1px solid var(--bc-line)", aspectRatio: "16/9", background: "var(--bc-panel)" }}>
            <img src={heroImg} alt={heroPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: heroPlayer.pos ?? "center top" }} />
          </div>
        )}

        <div style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", marginBottom: 28, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>}
          {item.readMinutes != null && <span>· {item.readMinutes} min read</span>}
          {item.time && !item.publishedAt && <span>{item.time}</span>}
          {item.read && !item.readMinutes && <span>· {item.read}</span>}
        </div>

        <div className="bc-prose" style={{ fontFamily: "var(--bc-body)", fontSize: 17, lineHeight: 1.65, color: "var(--bc-text)" }}>
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>

        {item.tags?.length > 0 && (
          <div style={{ marginTop: 36, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {item.tags.map((t) => (
              <span key={t} style={{ fontFamily: "var(--bc-sans)", fontSize: 11, fontWeight: 600, color: "var(--bc-sub)", border: "1px solid var(--bc-line)", padding: "5px 10px", borderRadius: 100 }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--bc-line)" }}>
          <Link to="/news" className="bc-cta" style={{ fontFamily: "var(--bc-sans)", fontSize: 14, color: "var(--bc-sub)", textDecoration: "none" }}>← Back to newsroom</Link>
        </div>
      </article>
    </>
  );
}
