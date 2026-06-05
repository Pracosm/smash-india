import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_NEWS } from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobileNews() {
  const { data: news } = usePolledJson("/data/news.json", { intervalMs: 60_000, seed: SEED_NEWS });
  const { data: articles } = usePolledJson("/data/articles.json", { intervalMs: 60_000, seed: [] });

  return (
    <div>
      <MobilePageHead
        eyebrow="NEWSROOM"
        title="The feed"
        dek="Indian-angle stories on world badminton, refreshed every 6 hours."
      />

      {articles && articles.length > 0 && (
        <>
          <div className="sm-h"><h2 className="sm-h-title">Editorials</h2></div>
          <div style={{ padding: "0 var(--pad)", display: "flex", flexDirection: "column", gap: 12 }}>
            {articles.map((a) => (
              <Link key={a.slug} to={`/news/${a.slug}`} className="sm-card" style={{ padding: 16 }}>
                <div className="sm-news-kicker">{(a.kicker || "FEATURE").toUpperCase()}</div>
                <h4 style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 18, lineHeight: 1.2, margin: "0 0 8px" }}>{a.title}</h4>
                {a.dek && <p style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", lineHeight: 1.45, margin: "0 0 10px" }}>{a.dek}</p>}
                <div className="sm-news-meta">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                  {" · "}{a.readMinutes ?? 4} min read
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="sm-h"><h2 className="sm-h-title">Headlines</h2></div>
      <div className="sm-news-list">
        {(news || []).map((n, i) => (
          <Link key={n.slug || n.title} to={n.slug ? `/news/${n.slug}` : "/news"} className={`sm-news-row${i % 2 ? " alt" : ""}`}>
            <div className="sm-news-bar" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sm-news-kicker">{(n.kicker || "NEWS").toUpperCase()}</div>
              <div className="sm-news-title">{n.title}</div>
              {(n.indian_angle || n.summary) && (
                <div className="sm-news-summary">{n.indian_angle || n.summary}</div>
              )}
              <div className="sm-news-meta">{n.time} · {n.read}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
