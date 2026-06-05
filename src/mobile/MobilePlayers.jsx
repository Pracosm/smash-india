import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_PLAYERS, PLAYER_PHOTOS, PHOTO_CREDITS } from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobilePlayers() {
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const list = (Array.isArray(players) && players.length > 0) ? players : SEED_PLAYERS;

  return (
    <div>
      <MobilePageHead
        eyebrow="INDIA'S HEADLINERS"
        title="Players"
        dek="The shuttlers shaping this season — singles, doubles, mixed."
      />
      <div style={{ padding: "18px var(--pad)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {list.map((p) => {
          const photo = PLAYER_PHOTOS[p.photo];
          const photo2 = p.photo2 ? PLAYER_PHOTOS[p.photo2] : null;
          return (
            <Link
              key={p.slug ?? p.name}
              to={p.slug ? `/players/${p.slug}` : "/"}
              className="sm-card"
              style={{ position: "relative" }}
            >
              {p.hot && <span className="sm-player-hot">🔥 HOT</span>}
              <div className="sm-player-photo" style={{ height: 180 }}>
                {photo2 ? (
                  <>
                    <div className="sm-photo-half"><img src={photo} alt="" loading="lazy" style={{ objectPosition: p.pos ?? "center top" }} /></div>
                    <div className="sm-photo-half"><img src={photo2} alt="" loading="lazy" style={{ objectPosition: p.pos2 ?? "center top" }} /></div>
                  </>
                ) : photo ? (
                  <img src={photo} alt={p.name} loading="lazy" style={{ objectPosition: p.pos ?? "center top" }} />
                ) : null}
                <span className="sm-player-rank bc-num" style={{ fontSize: 26 }}>#{p.rank}</span>
              </div>
              <div className="sm-player-body" style={{ padding: "10px 12px 12px" }}>
                <div className="sm-player-name" style={{ fontSize: 14 }}>{p.name}</div>
                <div className="sm-player-role">{p.role}</div>
                <div className="sm-form sm-player-form">
                  {p.form.map((r, i) => (
                    <span key={i} className={r === "W" ? "w" : "l"}>{r}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {PHOTO_CREDITS && (
        <div className="sm-credits">
          Photos:{" "}
          {PHOTO_CREDITS.map((c, i) => (
            <span key={c.player}>
              {i > 0 && " · "}
              {c.player} — {c.by} ({c.license})
            </span>
          ))}
          {" · via Wikimedia Commons"}
        </div>
      )}
    </div>
  );
}
