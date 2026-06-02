import { Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { BcForm } from "../components/primitives.jsx";
import { SEED_PLAYERS, PLAYER_PHOTOS, PHOTO_CREDITS } from "../data/seed.js";

export function PlayersIndex() {
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const list = players ?? [];

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "Players" }]}
        eyebrow="INDIA'S HEADLINERS"
        title="Players"
        dek="The Indian shuttlers shaping this season — singles, doubles, mixed. Click any card for bio, recent results and form."
      />
      <section style={{ paddingTop: 36, paddingBottom: 32 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {list.map((p) => {
            const photo = PLAYER_PHOTOS[p.photo];
            const photo2 = p.photo2 ? PLAYER_PHOTOS[p.photo2] : null;
            return (
              <Link
                key={p.slug ?? p.name}
                to={p.slug ? `/players/${p.slug}` : "/"}
                className="bc-card"
                style={{ textDecoration: "none", color: "inherit", background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 14, overflow: "hidden", position: "relative", display: "block" }}
              >
                {p.hot && (
                  <span style={{ position: "absolute", top: 12, right: 12, zIndex: 3, fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "var(--bc-bg)", background: "var(--bc-accent)", padding: "3px 7px", borderRadius: 3 }}>🔥 HOT</span>
                )}
                <div style={{ position: "relative", height: 220, background: "#0a1812", overflow: "hidden", display: "flex" }}>
                  {photo2 ? (
                    <>
                      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                        <img src={photo} alt={p.name.split("&")[0].trim()} loading="lazy"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                      </div>
                      <div style={{ width: 1, background: "rgba(0,0,0,0.55)" }} />
                      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                        <img src={photo2} alt={p.name.split("&")[1]?.trim() ?? p.name} loading="lazy"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos2 ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                      </div>
                    </>
                  ) : (
                    photo && (
                      <img src={photo} alt={p.name} loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center top", filter: "saturate(0.92) contrast(1.04)" }} />
                    )
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, color-mix(in srgb, var(--bc-bg) 18%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--bc-panel) 92%, transparent) 96%)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 14, zIndex: 2, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                    <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 32, color: "var(--bc-accent2)" }}>#{p.rank}</span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px 16px" }}>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--bc-sans)", fontSize: 11, color: "var(--bc-sub)", marginTop: 3 }}>{p.role}</div>
                  <div style={{ margin: "14px 0 4px" }}><BcForm form={p.form} /></div>
                </div>
              </Link>
            );
          })}
        </div>

        {PHOTO_CREDITS && (
          <div style={{ maxWidth: 1320, margin: "26px auto 0", fontFamily: "var(--bc-body)", fontSize: 10, lineHeight: 1.6, color: "var(--bc-sub)", opacity: 0.7, letterSpacing: "0.01em" }}>
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
      </section>
    </>
  );
}
