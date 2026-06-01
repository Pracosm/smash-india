import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_RANKINGS, SEED_PLAYERS } from "../data/seed.js";

const DISCIPLINES = ["All", "Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];

export function Rankings() {
  const [filter, setFilter] = useState("All");
  const { data: rankings } = usePolledJson("/data/rankings.json", { intervalMs: 300_000, seed: SEED_RANKINGS });
  const { data: players } = usePolledJson("/data/players.json", { intervalMs: 300_000, seed: SEED_PLAYERS });

  const filtered = filter === "All" ? (rankings || []) : (rankings || []).filter((r) => r.disc === filter);
  const slugFor = (name) => (players || []).find((p) => p.name === name)?.slug;

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "Rankings" }]}
        eyebrow="BWF WORLD RANKINGS"
        title="India in the world"
        dek="Every Indian player or pair inside the BWF top-50 across five disciplines. Refreshed every 6 hours from the BWF feeds."
      />
      <section style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 100, marginBottom: 26, width: "fit-content", flexWrap: "wrap" }}>
            {DISCIPLINES.map((d) => (
              <span
                key={d}
                onClick={() => setFilter(d)}
                className="bc-tab"
                style={{
                  fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 12, padding: "8px 14px", borderRadius: 100, letterSpacing: "0.02em",
                  color: filter === d ? "var(--bc-bg)" : "var(--bc-sub)",
                  background: filter === d ? "var(--bc-accent)" : "transparent",
                }}
              >{d}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ fontFamily: "var(--bc-body)", color: "var(--bc-sub)", padding: "24px 0" }}>No Indian players currently ranked in {filter}.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((r, i) => {
                const slug = slugFor(r.name);
                const content = (
                  <div className="bc-card" style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "14px 18px", position: "relative", overflow: "hidden", display: "block", textDecoration: "none", color: "inherit" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(20, 100 - i * 12)}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--bc-accent) 14%, transparent), transparent)" }} />
                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
                      <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 32, width: 56, color: "var(--bc-accent2)" }}>#{r.rank}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17 }}>{r.name}</div>
                        <div style={{ fontFamily: "var(--bc-sans)", fontSize: 12, color: "var(--bc-sub)" }}>{r.disc}</div>
                      </div>
                      <span className="bc-num" style={{ fontFamily: "var(--bc-body)", fontSize: 14, color: "var(--bc-sub)" }}>{r.pts}</span>
                      <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 13, color: r.move === "up" ? "var(--bc-accent2)" : r.move === "down" ? "var(--bc-accent)" : "var(--bc-sub)", width: 20 }}>
                        {r.move === "up" ? "▲" : r.move === "down" ? "▼" : "—"}
                      </span>
                    </div>
                  </div>
                );
                return slug ? <Link key={i} to={`/players/${slug}`} style={{ textDecoration: "none", color: "inherit" }}>{content}</Link> : <div key={i}>{content}</div>;
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
