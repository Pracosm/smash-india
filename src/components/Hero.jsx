import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_NEXT_EVENT } from "../data/seed.js";

function useCountdown(targetIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(targetIso).getTime();
  const inPast = !Number.isFinite(target) || target - now <= 0;
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const sec = Math.floor(diff / 1000);
  const p = (n) => String(n).padStart(2, "0");
  return { parts: [[p(d), "DAYS"], [p(h), "HRS"], [p(m), "MIN"], [p(sec), "SEC"]], inPast };
}

// Tournament names on BWF World Tour follow "<place> <type> [<year>]" — e.g.
// "Indonesia Open", "All England Open", "World Championships", "Korea Masters".
// We render the last word of the name in accent colour and the year in a
// stroked outline; everything else goes on a first line above. Works for
// every BWF event we serve without per-tournament tweaks.
function splitTitle(name, year) {
  const words = String(name ?? "").trim().split(/\s+/);
  if (words.length === 0) return { firstLine: "", accentWord: "", year };
  if (words.length === 1) return { firstLine: "", accentWord: words[0], year };
  return { firstLine: words.slice(0, -1).join(" "), accentWord: words[words.length - 1], year };
}

function slugify(s) {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function Hero() {
  const { data } = usePolledJson("/data/next-event.json", { seed: SEED_NEXT_EVENT });
  const event = data && typeof data === "object" && data.name ? data : SEED_NEXT_EVENT;
  const cd = useCountdown(event.startsAt);
  const year = Number.isFinite(new Date(event.startsAt).getTime())
    ? new Date(event.startsAt).getFullYear()
    : new Date().getFullYear();
  const { firstLine, accentWord } = splitTitle(event.name, year);
  const slug = slugify(event.name);

  return (
    <section style={{ position: "relative", borderBottom: "1px solid var(--bc-line)", overflow: "hidden" }}>
      <video
        className="bc-hero-video"
        src="/hero/hero.mp4"
        poster="/hero/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label="Indian street badminton scene under a blossoming tree"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 58%" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.2) 16%, transparent 36%)" }} />

      <div className="bc-hero-wrap" style={{ position: "relative", maxWidth: 1320, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 58px" }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 12, letterSpacing: "0.16em", color: "var(--bc-bg)", background: "var(--bc-accent2)", padding: "5px 11px", borderRadius: 3 }}>
              {cd.inPast ? "● LIVE" : "NEXT UP"} · {(event.grade ?? "BWF World Tour").toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--bc-sans)", fontSize: 13, color: "var(--bc-text)", letterSpacing: "0.06em", opacity: 0.9, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
              {(event.city ?? "").toUpperCase()}{event.venue ? ` · ${event.venue.toUpperCase()}` : ""}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: "clamp(54px, 7.4vw, 104px)", lineHeight: 0.84, letterSpacing: "0.005em", margin: "0 0 24px", textTransform: "uppercase", textShadow: "0 2px 36px rgba(0,0,0,0.55)" }}>
            {firstLine && <>{firstLine}<br /></>}
            <span style={{ color: "var(--bc-accent)" }}>{accentWord}</span>{" "}
            <span style={{ WebkitTextStroke: "1.5px var(--bc-text)", color: "transparent", opacity: 0.9 }}>{year}</span>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 30, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 14, color: "var(--bc-text)", letterSpacing: "0.04em", opacity: 0.92, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>{event.dates}</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--bc-text)", opacity: 0.5 }} />
            {cd.inPast ? (
              <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: "var(--bc-accent)", opacity: 0.95, textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>● LIVE NOW</span>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: "var(--bc-text)", opacity: 0.7 }}>STARTS IN</span>
                <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 24, letterSpacing: "0.03em", color: "var(--bc-text)", textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
                  {cd.parts.map(([v, l], i) => (
                    <Fragment key={l}>
                      {i > 0 && <span style={{ opacity: 0.35, margin: "0 7px" }}>:</span>}
                      {v}<span style={{ fontSize: 12, opacity: 0.65, marginLeft: 1 }}>{l[0].toLowerCase()}</span>
                    </Fragment>
                  ))}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link to={`/tournaments/${slug}`} className="bc-btn bc-accentbtn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 15, color: "var(--bc-bg)", background: "var(--bc-accent)", border: "none", padding: "15px 26px", borderRadius: 7, textDecoration: "none" }}>India's schedule →</Link>
            <button className="bc-btn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 15, color: "var(--bc-text)", background: "color-mix(in srgb, var(--bc-bg) 45%, transparent)", border: "1.5px solid var(--bc-line)", padding: "15px 24px", borderRadius: 7, backdropFilter: "blur(4px)" }}>⏰ Remind me</button>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 10, letterSpacing: "0.24em", color: "#fff", opacity: 0.82, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>SCROLL</span>
        <span className="bc-scrollcue" style={{ fontFamily: "var(--bc-sans)", fontSize: 18, lineHeight: 0.6, color: "#fff", opacity: 0.82, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>⌄</span>
      </div>
    </section>
  );
}
