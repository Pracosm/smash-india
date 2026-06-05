import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_NEWS, SEED_PLAYERS, PLAYER_PHOTOS } from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobileArticle() {
  const { slug } = useParams();
  const { data: articles } = usePolledJson("/data/articles.json", { intervalMs: 120_000, seed: [] });
  const { data: news } = usePolledJson("/data/news.json", { intervalMs: 120_000, seed: SEED_NEWS });
  const { data: players } = usePolledJson("/data/players.json", { intervalMs: 300_000, seed: SEED_PLAYERS });

  const article = (articles || []).find((a) => a.slug === slug);
  const newsItem = !article && (news || []).find((n) => n.slug === slug);

  if (!article && !newsItem) {
    return (
      <div>
        <MobilePageHead
          back={{ to: "/news", label: "Newsroom" }}
          eyebrow="NOT FOUND"
          title="Story not found"
          dek="This story might have been removed, or the link is wrong."
        />
      </div>
    );
  }

  const item = article || newsItem;
  const heroPlayer = article?.heroPlayerSlug && (players || []).find((p) => p.slug === article.heroPlayerSlug);
  const heroImg = heroPlayer && PLAYER_PHOTOS[heroPlayer.photo];
  const body = article?.body
    || [item.indian_angle, item.summary && `\n\n${item.summary}`].filter(Boolean).join("");

  return (
    <div>
      <MobilePageHead
        back={{ to: "/news", label: "Newsroom" }}
        eyebrow={(item.kicker || "STORY").toUpperCase()}
        title={item.title}
        dek={item.dek || item.indian_angle}
      />
      <article className="sm-article">
        {heroImg && (
          <div className="hero-img">
            <img src={heroImg} alt={heroPlayer.name} style={{ objectPosition: heroPlayer.pos ?? "center top" }} />
          </div>
        )}
        <div className="meta">
          {item.publishedAt && <>{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</>}
          {item.readMinutes != null && <> · {item.readMinutes} min read</>}
          {item.time && !item.publishedAt && <>{item.time}</>}
          {item.read && !item.readMinutes && <> · {item.read}</>}
        </div>
        <div className="prose">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
        {item.tags?.length > 0 && (
          <div className="tags">
            {item.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <div style={{ marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--bc-line)" }}>
          <Link to="/news" className="sm-back" style={{ marginLeft: 0 }}>← Back to newsroom</Link>
        </div>
      </article>
    </div>
  );
}
