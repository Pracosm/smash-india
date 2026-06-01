import { Link } from "react-router-dom";
import { BC_DATA } from "../data/broadcast.js";
import { BcHead } from "./primitives.jsx";

export function Schedule() {
  return (
    <section style={{ background: "var(--bc-panel)", borderBottom: "1px solid var(--bc-line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 0 40px" }}>
        <BcHead>Season ahead</BcHead>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0, marginTop: 6 }}>
          <div style={{ position: "absolute", left: 8, right: 8, top: 7, height: 2, background: "var(--bc-line)" }} />
          {BC_DATA.schedule.map((e) => (
            <div key={e.slug ?? e.name} style={{ position: "relative", paddingTop: 28, paddingRight: 18 }}>
              <span style={{
                position: "absolute", top: 0, left: 0, width: 16, height: 16, borderRadius: "50%",
                background: e.soon ? "var(--bc-accent)" : "var(--bc-panel)",
                border: `2px solid ${e.soon ? "var(--bc-accent)" : "var(--bc-sub)"}`,
                boxShadow: e.soon ? "0 0 12px var(--bc-accent)" : "none",
              }} />
              <Link to={e.slug ? `/tournaments/${e.slug}` : "/"} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                <div style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 16, color: e.soon ? "var(--bc-accent)" : "var(--bc-sub)", letterSpacing: "0.06em" }}>{e.date}</div>
                <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17, margin: "6px 0 3px" }}>{e.flag} {e.name}</div>
                <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)" }}>{e.grade} · {e.city}</div>
              </Link>
              {e.bwfUrl && (
                <a
                  href={e.bwfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bc-cta"
                  style={{ display: "inline-block", marginTop: 8, fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", color: "var(--bc-accent2)", textDecoration: "none" }}
                >
                  Live on BWF ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
