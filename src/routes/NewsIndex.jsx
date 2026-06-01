import { Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_NEWS } from "../data/seed.js";

export function NewsIndex() {
  const { data: news } = usePolledJson("/data/news.json", { intervalMs: 60_000, seed: SEED_NEWS });
  const { data: articles } = usePolledJson("/data/articles.json", { intervalMs: 60_000, seed: [] });

  // Articles first (long-form), then raw news headlines.
  return (
    <>
      <PageHead
        eyebrow="NEWSROOM"
        title="The feed"
        dek="Indian-angle stories on world badminton, refreshed every 6 hours. Daily editorials written by AI from the morning's reporting — small briefs, never filler."
      />
      <section style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>

          {articles && articles.length > 0 && (
            <>
              <h3 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--bc-sub)", marginBottom: 18 }}>EDITORIALS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 46 }}>
                {articles.map((a) => (
                  <Link key={a.slug} to={`/news/${a.slug}`} className="bc-card" style={{ textDecoration: "none", color: "inherit", background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 12, padding: "18px 20px", display: "block" }}>
                    <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em", color: "var(--bc-accent)", marginBottom: 8 }}>{(a.kicker || "FEATURE").toUpperCase()}</div>
                    <h4 style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 20, lineHeight: 1.18, margin: "0 0 8px", textWrap: "pretty" }}>{a.title}</h4>
                    {a.dek && <p style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", lineHeight: 1.45, margin: "0 0 12px" }}>{a.dek}</p>}
                    <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)" }}>
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                      {" · "}{a.readMinutes ?? 4} min read
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <h3 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--bc-sub)", marginBottom: 18 }}>HEADLINES</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(news || []).map((n) => (
              <Link key={n.slug || n.title} to={n.slug ? `/news/${n.slug}` : "/news"} className="bc-news" style={{ display: "flex", gap: 14, padding: "16px 14px", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
                <div style={{ width: 4, alignSelf: "stretch", background: "var(--bc-accent)", borderRadius: 2, flex: "0 0 auto" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "var(--bc-sub)", marginBottom: 5 }}>{(n.kicker || "NEWS").toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 17, lineHeight: 1.25 }}>{n.title}</div>
                  {(n.indian_angle || n.summary) && <div style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", marginTop: 6, lineHeight: 1.45 }}>{n.indian_angle || n.summary}</div>}
                  <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)", marginTop: 8, opacity: 0.85 }}>{n.time} · {n.read}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
