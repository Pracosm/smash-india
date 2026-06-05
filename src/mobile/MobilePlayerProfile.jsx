import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import {
  SEED_PLAYERS, SEED_NEWS, SEED_RECENT, SEED_RANKINGS, PLAYER_PHOTOS,
} from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobilePlayerProfile() {
  const { slug } = useParams();
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const { data: news } = usePolledJson("/data/news.json", { seed: SEED_NEWS });
  const { data: rankings } = usePolledJson("/data/rankings.json", { seed: SEED_RANKINGS });
  const { data: recent } = usePolledJson("/data/recent.json", { seed: SEED_RECENT });
  const [follow, setFollow] = useState(false);

  const player = (players || []).find((p) => p.slug === slug);

  if (!player) {
    return (
      <div>
        <MobilePageHead back={{ to: "/players", label: "Players" }} eyebrow="NOT FOUND" title="Player not found" />
      </div>
    );
  }

  const photo = PLAYER_PHOTOS[player.photo];
  const photo2 = player.photo2 ? PLAYER_PHOTOS[player.photo2] : null;
  const rankInfo = (rankings || []).find((r) => r.name === player.name);
  const lcParts = player.name.toLowerCase().split(/[&/]+/).map((s) => s.trim()).filter(Boolean);
  const tagged = (news || []).filter((n) => {
    const text = `${n.title} ${n.indian_angle ?? ""} ${n.summary ?? ""}`.toLowerCase();
    return lcParts.some((part) => text.includes(part));
  });
  const recentForPlayer = (Array.isArray(recent) && recent.length > 0 ? recent : SEED_RECENT ?? [])
    .filter((m) => {
      const a = m.a.toLowerCase(), b = m.b.toLowerCase();
      return lcParts.some((p) => a.includes(p) || b.includes(p));
    });

  return (
    <div>
      {/* photo hero */}
      <div className="sm-pp-hero">
        {photo2 ? (
          <>
            <div className="half"><img src={photo} alt="" style={{ objectPosition: player.pos ?? "center top" }} /></div>
            <div className="divider" />
            <div className="half"><img src={photo2} alt="" style={{ objectPosition: player.pos2 ?? "center top" }} /></div>
          </>
        ) : photo ? (
          <img src={photo} alt={player.name} style={{ objectPosition: player.pos ?? "center top" }} />
        ) : null}
        <div className="scrim" />
        <Link to="/players" className="sm-back" style={{ position: "absolute", top: "calc(var(--top-h) + env(safe-area-inset-top, 0px) + 8px)", left: 12, zIndex: 3, background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", color: "var(--bc-text)" }}>← Players</Link>
        <div className="info">
          <div className="role">{player.role.toUpperCase()}</div>
          <h1 className="name">{player.name}</h1>
        </div>
      </div>

      {player.bio && (
        <p style={{ padding: "16px var(--pad) 4px", fontFamily: "var(--bc-body)", fontSize: 14, lineHeight: 1.55, color: "var(--bc-sub)", margin: 0 }}>
          {player.bio}
        </p>
      )}

      <div className="sm-pp-stats">
        <div className="sm-stat accent">
          <div className="lbl">World rank</div>
          <div className="val">#{player.rank}</div>
        </div>
        <div className="sm-stat">
          <div className="lbl">Discipline</div>
          <div className="val" style={{ fontSize: 16 }}>{player.role}</div>
        </div>
        <div className="sm-stat">
          <div className="lbl">Points</div>
          <div className="val" style={{ fontSize: 18 }}>{rankInfo?.pts ?? "—"}</div>
        </div>
        <div className="sm-stat">
          <div className="lbl">Move</div>
          <div className="val" style={{ fontSize: 18 }}>
            {rankInfo?.move === "up" ? "▲ Up" : rankInfo?.move === "down" ? "▼ Down" : "—"}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 var(--pad)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="lbl" style={{ fontFamily: "var(--bc-sans)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--bc-sub)", marginBottom: 8 }}>Last 5</div>
          <div className="sm-form">
            {player.form.map((r, i) => (
              <span key={i} className={r === "W" ? "w" : "l"} style={{ width: 24, height: 24, fontSize: 12 }}>{r}</span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFollow((f) => !f)}
          className={`sm-btn sm-btn-block ${follow ? "" : "sm-btn-primary"}`}
        >
          {follow ? "✓ Following" : `★ Follow ${player.name.split("&")[0].trim()}`}
        </button>
      </div>

      {recentForPlayer.length > 0 && (
        <section className="sm-pp-section">
          <h3>Recent results</h3>
          {recentForPlayer.map((m, i) => {
            const aIsThem = lcParts.some((p) => m.a.toLowerCase().includes(p));
            const playerWon = (m.win === "a" && aIsThem) || (m.win === "b" && !aIsThem);
            return (
              <div key={i} className="sm-result">
                <div className="top">
                  <span>{m.disc}</span>
                  <span>{m.event}</span>
                </div>
                <div className="vs">
                  <span style={{ color: m.ac === "IND" ? "var(--bc-accent2)" : "var(--bc-text)" }}>{m.a}</span>
                  <span style={{ color: "var(--bc-sub)", margin: "0 6px" }}>vs</span>
                  <span style={{ color: m.bc === "IND" ? "var(--bc-accent2)" : "var(--bc-text)" }}>{m.b}</span>
                </div>
                <div className="score">
                  <span className="bc-num">{m.s}</span>
                  <span className={`verdict ${playerWon ? "won" : "lost"}`}>{playerWon ? "WON" : "LOST"}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tagged.length > 0 && (
        <section className="sm-pp-section" style={{ paddingBottom: 24 }}>
          <h3>In the news</h3>
          <div className="sm-news-list" style={{ padding: 0 }}>
            {tagged.map((n, i) => (
              <Link key={n.slug || i} to={n.slug ? `/news/${n.slug}` : "/news"} className={`sm-news-row${i % 2 ? " alt" : ""}`}>
                <div className="sm-news-bar" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sm-news-kicker">{(n.kicker || "NEWS").toUpperCase()}</div>
                  <div className="sm-news-title">{n.title}</div>
                  <div className="sm-news-meta">{n.time} · {n.read}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
