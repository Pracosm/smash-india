import { BC_DATA } from "../data/broadcast.js";

export function FreshResult() {
  const r = BC_DATA.freshResult;
  return (
    <section style={{ background: "linear-gradient(90deg, var(--bc-accent2) 0%, color-mix(in srgb, var(--bc-accent2) 55%, var(--bc-bg)) 100%)", color: "var(--bc-bg)" }}>
      <div className="bc-fresh" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, padding: "16px 0" }}>
        <span style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", background: "var(--bc-bg)", color: "var(--bc-accent2)", padding: "6px 12px", borderRadius: 4 }}>🏆 {r.tag}</span>
        <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17 }}>
          {r.winner} <span style={{ fontWeight: 500, opacity: 0.75 }}>beat {r.loser}</span>{" "}
          <b className="bc-num" style={{ marginLeft: 6 }}>{r.score}</b>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 13, opacity: 0.8, letterSpacing: "0.04em" }}>{r.event.toUpperCase()} · {r.when.toUpperCase()}</span>
      </div>
    </section>
  );
}
