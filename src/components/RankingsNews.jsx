import { Link, useNavigate } from "react-router-dom";
import { BC_DATA } from "../data/broadcast.js";
import { BcHead, BcPhoto } from "./primitives.jsx";

export function RankingsNews() {
  const navigate = useNavigate();
  return (
    <section style={{ borderBottom: "1px solid var(--bc-line)" }}>
      <div className="bc-grid-rn" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, padding: "34px 0 40px" }}>
        <div>
          <BcHead cta="Full table" onCta={() => navigate("/rankings")}>India in the world rankings</BcHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {BC_DATA.rankings.slice(0, 6).map((r, i) => {
              const pct = Math.max(22, 100 - i * 14);
              return (
                <div key={i} className="bc-card" style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "12px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--bc-accent) 16%, transparent), transparent)" }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 32, width: 54, color: "var(--bc-accent2)" }}>#{r.rank}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 16 }}>{r.name}</div>
                      <div style={{ fontFamily: "var(--bc-sans)", fontSize: 12, color: "var(--bc-sub)" }}>{r.disc}</div>
                    </div>
                    <span className="bc-num" style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)" }}>{r.pts}</span>
                    <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 12, color: r.move === "up" ? "var(--bc-accent2)" : r.move === "down" ? "var(--bc-accent)" : "var(--bc-sub)", width: 16 }}>
                      {r.move === "up" ? "▲" : r.move === "down" ? "▼" : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <BcHead cta="Newsroom" onCta={() => navigate("/news")}>The feed</BcHead>
          <Link to={BC_DATA.news[0].slug ? `/news/${BC_DATA.news[0].slug}` : "/news"} className="bc-card" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--bc-line)", marginBottom: 14, cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
            <BcPhoto label="LEAD STORY" style={{ height: 156 }} />
            <div style={{ padding: "14px 18px", background: "var(--bc-panel)" }}>
              <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: "var(--bc-accent)", marginBottom: 6 }}>{BC_DATA.news[0].kicker.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 20, lineHeight: 1.15, textWrap: "pretty" }}>{BC_DATA.news[0].title}</div>
              <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 8 }}>{BC_DATA.news[0].time} · {BC_DATA.news[0].read} read</div>
            </div>
          </Link>
          {BC_DATA.news.slice(1).map((n, i) => (
            <Link key={n.slug || i} to={n.slug ? `/news/${n.slug}` : "/news"} className="bc-news" style={{ display: "flex", gap: 14, padding: "13px 12px", borderRadius: 8, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 4, alignSelf: "stretch", background: i % 2 ? "var(--bc-accent2)" : "var(--bc-accent)", borderRadius: 2, flex: "0 0 auto" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "var(--bc-sub)", marginBottom: 5 }}>{n.kicker.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 16, lineHeight: 1.2, textWrap: "pretty" }}>{n.title}</div>
                <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)", marginTop: 6 }}>{n.time} · {n.read}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
