import { useState } from "react";
import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_RANKINGS, SEED_PLAYERS } from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

const DISCIPLINES = ["All", "Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"];
const SHORT = {
  "All": "All",
  "Men's Singles": "MS",
  "Women's Singles": "WS",
  "Men's Doubles": "MD",
  "Women's Doubles": "WD",
  "Mixed Doubles": "XD",
};

export function MobileRankings() {
  const [filter, setFilter] = useState("All");
  const { data: rankings } = usePolledJson("/data/rankings.json", { intervalMs: 300_000, seed: SEED_RANKINGS });
  const { data: players } = usePolledJson("/data/players.json", { intervalMs: 300_000, seed: SEED_PLAYERS });

  const list = (Array.isArray(rankings) && rankings.length > 0) ? rankings : SEED_RANKINGS;
  const filtered = filter === "All" ? list : list.filter((r) => r.disc === filter);
  const slugFor = (name) => (players || []).find((p) => p.name === name)?.slug;

  return (
    <div>
      <MobilePageHead
        eyebrow="BWF WORLD RANKINGS"
        title="India in the world"
        dek="Every Indian player or pair inside the BWF top-50, refreshed every 6 hours."
      />
      <div className="sm-pills" style={{ paddingTop: 14, paddingBottom: 10 }}>
        {DISCIPLINES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setFilter(d)}
            className={`sm-pill${filter === d ? " active" : ""}`}
          >
            {SHORT[d]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="sm-empty">No Indian players currently ranked in {filter}.</div>
      ) : (
        <div className="sm-rank-list">
          {filtered.map((r, i) => {
            const slug = slugFor(r.name);
            const body = (
              <div className="sm-rank-row">
                <div className="sm-rank-bar" style={{ width: `${Math.max(18, 100 - i * 10)}%` }} />
                <span className="sm-rank-num bc-num">#{r.rank}</span>
                <div style={{ flex: 1, zIndex: 1, minWidth: 0 }}>
                  <div className="sm-rank-name">{r.name}</div>
                  <div className="sm-rank-disc">{r.disc}</div>
                </div>
                <span className="sm-rank-pts bc-num">{r.pts}</span>
                <span className={`sm-rank-move ${r.move}`}>
                  {r.move === "up" ? "▲" : r.move === "down" ? "▼" : "—"}
                </span>
              </div>
            );
            return slug
              ? <Link key={i} to={`/players/${slug}`} style={{ textDecoration: "none" }}>{body}</Link>
              : <div key={i}>{body}</div>;
          })}
        </div>
      )}
    </div>
  );
}
