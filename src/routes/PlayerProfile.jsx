import { useParams, Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { BcFlag, BcForm } from "../components/primitives.jsx";
import {
  SEED_PLAYERS, SEED_NEWS, SEED_RECENT, SEED_RANKINGS, PLAYER_PHOTOS,
} from "../data/seed.js";

export function PlayerProfile() {
  const { slug } = useParams();
  const { data: players } = usePolledJson("/data/players.json", { intervalMs: 300_000, seed: SEED_PLAYERS });
  const { data: news } = usePolledJson("/data/news.json", { intervalMs: 120_000, seed: SEED_NEWS });
  const { data: rankings } = usePolledJson("/data/rankings.json", { intervalMs: 300_000, seed: SEED_RANKINGS });

  const player = (players || []).find((p) => p.slug === slug);

  if (!player) {
    return (
      <>
        <PageHead crumb={[{ label: "Home", to: "/" }, { label: "Players" }]} eyebrow="NOT FOUND" title="Player not found" />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 0 96px" }}>
          <Link to="/" className="bc-cta" style={{ fontFamily: "var(--bc-sans)", fontSize: 14, color: "var(--bc-sub)" }}>← Back home</Link>
        </div>
      </>
    );
  }

  const photo = PLAYER_PHOTOS[player.photo];
  const photo2 = player.photo2 ? PLAYER_PHOTOS[player.photo2] : null;
  const rankInfo = (rankings || []).find((r) => r.name === player.name);

  // Find news that mentions this player by name (cheap heuristic).
  const tagged = (news || []).filter((n) => {
    const text = `${n.title} ${n.indian_angle ?? ""} ${n.summary ?? ""}`.toLowerCase();
    return player.name.toLowerCase().split(/[&/]+/).some((part) => text.includes(part.trim()));
  });

  // Recent results filtered by player name.
  const lcName = player.name.toLowerCase();
  const recentForPlayer = (SEED_RECENT || []).filter((m) => m.a.toLowerCase().includes(lcName) || m.b.toLowerCase().includes(lcName));

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "Players" }, { label: player.name }]}
        eyebrow={player.role.toUpperCase()}
        title={player.name}
        dek={player.bio}
      />

      <section style={{ paddingTop: 36, paddingBottom: 56, borderBottom: "1px solid var(--bc-line)" }}>
        <div className="bc-profile-grid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "320px 1fr", gap: 36, alignItems: "start" }}>

          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--bc-line)", background: "var(--bc-panel)", aspectRatio: "3/4", display: "flex" }}>
            {photo2 ? (
              <>
                <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                  <img src={photo} alt={player.name.split("&")[0].trim()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: player.pos ?? "center top" }} />
                </div>
                <div style={{ width: 1, background: "rgba(0,0,0,0.55)" }} />
                <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                  <img src={photo2} alt={player.name.split("&")[1]?.trim() ?? player.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: player.pos2 ?? "center top" }} />
                </div>
              </>
            ) : (
              photo && <img src={photo} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: player.pos ?? "center top" }} />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              <Stat label="World rank" value={`#${player.rank}`} accent />
              <Stat label="Discipline" value={player.role} />
              <Stat label="Points"     value={rankInfo?.pts ?? "—"} />
              <Stat label="Move"       value={rankInfo?.move === "up" ? "▲ Up" : rankInfo?.move === "down" ? "▼ Down" : "—"} />
            </div>

            <div>
              <div style={{ fontFamily: "var(--bc-sans)", fontSize: 10, letterSpacing: "0.14em", color: "var(--bc-sub)", textTransform: "uppercase", marginBottom: 8 }}>Last 5</div>
              <BcForm form={player.form} />
            </div>

            <div>
              <button className="bc-btn bc-accentbtn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 14, color: "var(--bc-bg)", background: "var(--bc-accent)", border: "none", padding: "13px 22px", borderRadius: 7 }}>★ Follow {player.name.split("&")[0].trim()}</button>
            </div>
          </div>
        </div>
      </section>

      {recentForPlayer.length > 0 && (
        <section style={{ paddingTop: 36, paddingBottom: 36, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <h3 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22, letterSpacing: "0.03em", textTransform: "uppercase", margin: "0 0 14px" }}>Recent results</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentForPlayer.map((m, i) => (
                <div key={i} className="bc-card" style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: "var(--bc-sans)", fontSize: 11, color: "var(--bc-sub)", letterSpacing: "0.04em", minWidth: 110 }}>{m.disc} · {m.event}</span>
                  <span style={{ flex: 1, fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 14 }}>
                    <BcFlag code={m.ac} /> {m.a} <span style={{ color: "var(--bc-sub)", margin: "0 6px" }}>vs</span> <BcFlag code={m.bc} /> {m.b}
                  </span>
                  <span className="bc-num" style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 13, color: "var(--bc-text)" }}>{m.s}</span>
                  <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, color: (m.win === "a" && lcName === m.a.toLowerCase()) || (m.win === "b" && lcName === m.b.toLowerCase()) ? "var(--bc-accent2)" : "var(--bc-accent)" }}>
                    {(m.win === "a" && lcName === m.a.toLowerCase()) || (m.win === "b" && lcName === m.b.toLowerCase()) ? "WON" : "LOST"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tagged.length > 0 && (
        <section style={{ paddingTop: 36, paddingBottom: 72 }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <h3 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22, letterSpacing: "0.03em", textTransform: "uppercase", margin: "0 0 14px" }}>In the news</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {tagged.map((n) => (
                <Link key={n.slug || n.title} to={n.slug ? `/news/${n.slug}` : "/news"} className="bc-news" style={{ display: "flex", gap: 14, padding: "13px 12px", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
                  <div style={{ width: 4, alignSelf: "stretch", background: "var(--bc-accent2)", borderRadius: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: "var(--bc-sub)", marginBottom: 5 }}>{(n.kicker || "NEWS").toUpperCase()}</div>
                    <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 16, lineHeight: 1.25 }}>{n.title}</div>
                    <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)", marginTop: 6 }}>{n.time} · {n.read}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ fontFamily: "var(--bc-sans)", fontSize: 10, letterSpacing: "0.14em", color: "var(--bc-sub)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: accent ? 30 : 18, color: accent ? "var(--bc-accent2)" : "var(--bc-text)" }}>{value}</div>
    </div>
  );
}
