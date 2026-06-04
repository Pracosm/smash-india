import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_PLAYERS, PLAYER_PHOTOS, PHOTO_CREDITS } from "../data/seed.js";
import { BcHead, BcForm } from "./primitives.jsx";

// Resolve raw photo filenames (as written by the pipeline into players.json)
// into the imported asset URLs Vite emits at build time. Identical to the
// pattern used by FeaturedBanner.
function withPhotos(list) {
  return (Array.isArray(list) ? list : []).map((p) => ({
    ...p,
    photo: PLAYER_PHOTOS[p.photo] ?? p.photo,
    photo2: p.photo2 ? PLAYER_PHOTOS[p.photo2] ?? p.photo2 : undefined,
  }));
}

export function Players() {
  const [followed, setFollowed] = useState({});
  const navigate = useNavigate();
  const { data } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const players = withPhotos(Array.isArray(data) && data.length > 0 ? data : SEED_PLAYERS);

  return (
    <section style={{ borderBottom: "1px solid var(--bc-line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 0 28px" }}>
        <BcHead cta="All players" onCta={() => navigate("/players")}>India's headliners</BcHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          {players.map((p) => {
            const on = !!followed[p.name];
            const toggle = (e) => {
              e.preventDefault();
              setFollowed((f) => ({ ...f, [p.name]: !f[p.name] }));
            };
            return (
              <Link
                key={p.slug ?? p.name}
                to={p.slug ? `/players/${p.slug}` : "/"}
                className="bc-card"
                style={{ textDecoration: "none", color: "inherit", background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 14, overflow: "hidden", position: "relative", display: "block" }}
              >
                {p.hot && <span style={{ position: "absolute", top: 12, right: 12, zIndex: 3, fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "var(--bc-bg)", background: "var(--bc-accent)", padding: "3px 7px", borderRadius: 3 }}>🔥 HOT</span>}

                <div style={{ position: "relative", height: 180, background: "#0a1812", overflow: "hidden", display: "flex" }}>
                  {p.photo2 ? (
                    <>
                      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                        <img src={p.photo} alt={p.name.split("&")[0].trim()} loading="lazy"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                      </div>
                      <div style={{ width: 1, background: "rgba(0,0,0,0.55)" }} />
                      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                        <img src={p.photo2} alt={p.name.split("&")[1]?.trim() ?? p.name} loading="lazy"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos2 ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                      </div>
                    </>
                  ) : (
                    p.photo && (
                      <img src={p.photo} alt={p.name} loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                    )
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, color-mix(in srgb, var(--bc-bg) 18%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--bc-panel) 92%, transparent) 96%)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 14, zIndex: 2, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                    <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 30, color: "var(--bc-accent2)" }}>#{p.rank}</span>
                  </div>
                </div>

                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--bc-sans)", fontSize: 11, color: "var(--bc-sub)", marginTop: 2 }}>{p.role}</div>
                  <div style={{ margin: "12px 0 10px" }}><BcForm form={p.form} /></div>
                  <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginBottom: 12, minHeight: 30, textWrap: "pretty" }}>{p.note}</div>
                  <button onClick={toggle} className="bc-followbtn" style={{
                    width: "100%", fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 12, padding: "9px 0", borderRadius: 7,
                    border: on ? "1px solid var(--bc-accent)" : "1px solid var(--bc-line)",
                    background: on ? "color-mix(in srgb, var(--bc-accent) 18%, transparent)" : "transparent",
                    color: on ? "var(--bc-accent)" : "var(--bc-text)",
                  }}>{on ? "✓ Following" : "+ Follow"}</button>
                </div>
              </Link>
            );
          })}
        </div>

        {PHOTO_CREDITS && (
          <div style={{ marginTop: 18, fontFamily: "var(--bc-body)", fontSize: 10, lineHeight: 1.6, color: "var(--bc-sub)", opacity: 0.7, letterSpacing: "0.01em" }}>
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
    </section>
  );
}
