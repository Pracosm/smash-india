import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_FEATURED_EVENT, SEED_PLAYERS, PLAYER_PHOTOS } from "../data/seed.js";

// Status:
// - "before" → "STARTS IN  03d : 14h : 12m"
// - "during" → "● ON COURT · DAY 3 of 6"
// - "after"  → component renders nothing (banner self-hides)
function useTournamentStatus(startIso, endIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  if (now < start) {
    let diff = start - now;
    const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
    const h = Math.floor(diff / 3_600_000);  diff -= h * 3_600_000;
    const m = Math.floor(diff / 60_000);
    return { phase: "before", days: d, hours: h, minutes: m };
  }
  if (now > end) return { phase: "after" };
  const totalDays = Math.max(1, Math.ceil((end - start) / 86_400_000));
  const dayNumber = Math.min(totalDays, Math.floor((now - start) / 86_400_000) + 1);
  return { phase: "during", dayNumber, totalDays };
}

export function FeaturedBanner() {
  const { data: event } = usePolledJson("/data/featured-event.json", { seed: SEED_FEATURED_EVENT });
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const status = useTournamentStatus(event?.startsAt, event?.endsAt);

  if (!event || !status || status.phase === "after") return null;

  const indiaPlayers = (event.indiaContingent ?? [])
    .map((c) => c.playerSlug && (players ?? []).find((p) => p.slug === c.playerSlug))
    .filter(Boolean);
  const showPhotos = indiaPlayers.slice(0, 6);
  const overflow = Math.max(0, (event.indiaContingent?.length ?? 0) - showPhotos.length);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section style={{
      background: "linear-gradient(90deg, var(--bc-panel) 0%, color-mix(in srgb, var(--bc-panel) 70%, var(--bc-accent) 30%) 100%)",
      borderBottom: "1px solid var(--bc-line)",
      borderTop: "1px solid var(--bc-line)",
    }}>
      <Link to={`/tournaments/${event.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="bc-featured bc-featured-grid" style={{
          maxWidth: 1320, margin: "0 auto",
          display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 32,
          padding: "20px 0",
        }}>
          {/* Status + countdown / day */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 220 }}>
            {status.phase === "during" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="bc-livedot" style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--bc-live)", boxShadow: "0 0 10px var(--bc-live)" }} />
                  <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", color: "var(--bc-live)" }}>ON COURT NOW</span>
                </div>
                <div className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 30, letterSpacing: "0.02em", lineHeight: 1 }}>
                  DAY {status.dayNumber} <span style={{ opacity: 0.5, fontSize: 18 }}>of {status.totalDays}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", color: "var(--bc-accent2)" }}>STARTS IN</div>
                <div className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 26, letterSpacing: "0.02em", lineHeight: 1 }}>
                  {pad(status.days)}d <span style={{ opacity: 0.35, margin: "0 4px" }}>:</span>
                  {pad(status.hours)}h <span style={{ opacity: 0.35, margin: "0 4px" }}>:</span>
                  {pad(status.minutes)}m
                </div>
              </>
            )}
            <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 2 }}>{event.dates}</div>
          </div>

          {/* Event identity */}
          <div style={{ borderLeft: "1px solid var(--bc-line)", paddingLeft: 28 }}>
            <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", color: "var(--bc-accent)", marginBottom: 6 }}>FEATURED · {event.grade.split("·").pop().trim().toUpperCase()}</div>
            <div style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 32, letterSpacing: "0.01em", lineHeight: 1, textTransform: "uppercase" }}>
              {event.flag} {event.name} {event.edition}
            </div>
            <div style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", marginTop: 6 }}>
              {event.city} · {event.venue?.name ?? ""} · {event.indiaContingent?.length ?? 0} Indians in draw
            </div>
          </div>

          {/* India contingent + CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {showPhotos.map((p, i) => {
                const photo = PLAYER_PHOTOS[p.photo];
                return (
                  <div key={p.slug} style={{
                    width: 38, height: 38, borderRadius: "50%", overflow: "hidden",
                    border: "2px solid var(--bc-panel)",
                    marginLeft: i === 0 ? 0 : -10,
                    background: "var(--bc-bg)", flexShrink: 0,
                  }}>
                    {photo && <img src={photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center top" }} />}
                  </div>
                );
              })}
              {overflow > 0 && (
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: "2px solid var(--bc-panel)", marginLeft: -10, background: "var(--bc-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, color: "var(--bc-sub)",
                }}>+{overflow}</div>
              )}
            </div>
            <span className="bc-btn bc-accentbtn" style={{
              fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 13,
              color: "var(--bc-bg)", background: "var(--bc-accent)", padding: "10px 16px", borderRadius: 7, whiteSpace: "nowrap",
            }}>Tournament hub →</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
