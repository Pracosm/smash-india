import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import {
  SEED_NEXT_EVENT, SEED_FEATURED_EVENT, SEED_FRESH_RESULT,
  SEED_PLAYERS, SEED_RANKINGS, SEED_NEWS, SEED_SCHEDULE,
  PLAYER_PHOTOS,
} from "../data/seed.js";

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
  const s = Math.floor(diff / 1000);
  const p = (n) => String(n).padStart(2, "0");
  return { parts: [[p(d), "d"], [p(h), "h"], [p(m), "m"], [p(s), "s"]], inPast };
}

function useStatus(startIso, endIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (now < start) {
    let d = start - now;
    const days = Math.floor(d / 86400000); d -= days * 86400000;
    const hours = Math.floor(d / 3600000); d -= hours * 3600000;
    const mins = Math.floor(d / 60000);
    return { phase: "before", days, hours, minutes: mins };
  }
  if (now > end) return { phase: "after" };
  const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
  const dayNumber = Math.min(totalDays, Math.floor((now - start) / 86400000) + 1);
  return { phase: "during", dayNumber, totalDays };
}

function splitTitle(name) {
  const words = String(name ?? "").trim().split(/\s+/);
  if (words.length === 0) return { firstLine: "", accentWord: "" };
  if (words.length === 1) return { firstLine: "", accentWord: words[0] };
  return { firstLine: words.slice(0, -1).join(" "), accentWord: words[words.length - 1] };
}

function slugify(s) {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const PLACEHOLDER = /(^|\b)(opponent|tbd|unknown|n\/?a)\b/i;

export function MobileHome() {
  const { data: nextEvent } = usePolledJson("/data/next-event.json", { seed: SEED_NEXT_EVENT });
  const { data: featured } = usePolledJson("/data/featured-event.json", { seed: SEED_FEATURED_EVENT });
  const { data: fresh } = usePolledJson("/data/fresh-result.json", { seed: SEED_FRESH_RESULT });
  const { data: playersRaw } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const { data: rankingsRaw } = usePolledJson("/data/rankings.json", { seed: SEED_RANKINGS });
  const { data: newsRaw } = usePolledJson("/data/news.json", { seed: SEED_NEWS });
  const { data: scheduleRaw } = usePolledJson("/data/schedule.json", { seed: SEED_SCHEDULE });

  const event = nextEvent && nextEvent.name ? nextEvent : SEED_NEXT_EVENT;
  const cd = useCountdown(event.startsAt);
  const year = Number.isFinite(new Date(event.startsAt).getTime())
    ? new Date(event.startsAt).getFullYear()
    : new Date().getFullYear();
  const { firstLine, accentWord } = splitTitle(event.name);
  const slug = slugify(event.name);

  const players = (Array.isArray(playersRaw) && playersRaw.length > 0 ? playersRaw : SEED_PLAYERS);
  const rankings = Array.isArray(rankingsRaw) && rankingsRaw.length > 0 ? rankingsRaw : SEED_RANKINGS;
  const news = Array.isArray(newsRaw) && newsRaw.length > 0 ? newsRaw : SEED_NEWS;
  const schedule = Array.isArray(scheduleRaw) && scheduleRaw.length > 0 ? scheduleRaw : SEED_SCHEDULE;

  return (
    <div>
      {/* HERO */}
      <section className="sm-hero">
        <video
          className="sm-hero-video"
          src="/hero/hero.mp4"
          poster="/hero/hero-poster.jpg"
          autoPlay loop muted playsInline preload="metadata"
          aria-label="Indian street badminton scene"
        />
        <div className="sm-hero-scrim" />
        <div className="sm-hero-content">
          <span className="sm-hero-eyebrow">
            {cd.inPast ? "● LIVE" : "NEXT UP"} · {(event.grade ?? "BWF").split("·").pop().trim().toUpperCase()}
          </span>
          <div className="sm-hero-loc">
            {(event.city ?? "").toUpperCase()}{event.venue ? ` · ${event.venue.toUpperCase()}` : ""}
          </div>
          <h1 className="sm-hero-title">
            {firstLine && <>{firstLine}<br /></>}
            <span style={{ color: "var(--bc-accent)" }}>{accentWord}</span>{" "}
            <span className="sm-year">{year}</span>
          </h1>
          <div className="sm-hero-meta">
            <span>{event.dates}</span>
            {cd.inPast ? (
              <span style={{ color: "var(--bc-accent)", fontWeight: 700, letterSpacing: ".14em" }}>● LIVE NOW</span>
            ) : (
              <span className="sm-hero-countdown bc-num">
                <span className="lbl">STARTS IN</span>
                {cd.parts.map(([v, l], i) => (
                  <Fragment key={l}>
                    {i > 0 && <span style={{ opacity: .35 }}>:</span>}
                    {v}<span style={{ fontSize: 12, opacity: .65 }}>{l}</span>
                  </Fragment>
                ))}
              </span>
            )}
          </div>
          <div className="sm-hero-ctas">
            <Link to={`/tournaments/${slug}`} className="sm-btn sm-btn-primary">
              India's schedule →
            </Link>
            <button type="button" className="sm-btn sm-btn-ghost">⏰ Remind me</button>
          </div>
        </div>
      </section>

      {/* FEATURED EVENT CARD — overlaps hero */}
      {featured && <MobileFeatured event={featured} players={players} />}

      {/* FRESH RESULT STRAP */}
      {fresh && <MobileFresh data={fresh} />}

      {/* HEADLINERS RAIL */}
      <SectionHead title="Headliners" cta="All players" to="/players" />
      <div className="sm-rail">
        {players.map((p) => {
          const photo = PLAYER_PHOTOS[p.photo];
          const photo2 = p.photo2 ? PLAYER_PHOTOS[p.photo2] : null;
          return (
            <Link
              key={p.slug ?? p.name}
              to={p.slug ? `/players/${p.slug}` : "/"}
              className="sm-player-card"
            >
              {p.hot && <span className="sm-player-hot">🔥 HOT</span>}
              <div className="sm-player-photo">
                {photo2 ? (
                  <>
                    <div className="sm-photo-half"><img src={photo} alt="" loading="lazy" style={{ objectPosition: p.pos ?? "center top" }} /></div>
                    <div className="sm-photo-half"><img src={photo2} alt="" loading="lazy" style={{ objectPosition: p.pos2 ?? "center top" }} /></div>
                  </>
                ) : photo ? (
                  <img src={photo} alt={p.name} loading="lazy" style={{ objectPosition: p.pos ?? "center top" }} />
                ) : null}
                <span className="sm-player-rank bc-num">#{p.rank}</span>
              </div>
              <div className="sm-player-body">
                <div className="sm-player-name">{p.name}</div>
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

      {/* TOP 5 RANKINGS */}
      <SectionHead title="India in the world" cta="Full table" to="/rankings" />
      <div className="sm-rank-list">
        {rankings.slice(0, 5).map((r, i) => {
          const slug = players.find((p) => p.name === r.name)?.slug;
          const body = (
            <div className="sm-rank-row">
              <div className="sm-rank-bar" style={{ width: `${Math.max(20, 100 - i * 14)}%` }} />
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

      {/* NEWS */}
      <SectionHead title="The feed" cta="Newsroom" to="/news" />
      {news[0] && (
        <Link to={news[0].slug ? `/news/${news[0].slug}` : "/news"} className="sm-news-lead">
          <div className="sm-news-lead-img">
            <span className="sm-news-lead-tag">LEAD STORY</span>
          </div>
          <div className="sm-news-lead-body">
            <div className="sm-news-kicker">{(news[0].kicker || "NEWS").toUpperCase()}</div>
            <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{news[0].title}</div>
            <div className="sm-news-meta">{news[0].time} · {news[0].read} read</div>
          </div>
        </Link>
      )}
      <div className="sm-news-list">
        {news.slice(1, 5).map((n, i) => (
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

      {/* SEASON AHEAD */}
      <SectionHead title="Season ahead" cta="Calendar" to="/tournaments" />
      <div className="sm-schedule">
        {schedule.map((e) => (
          <Link key={e.slug ?? e.name} to={e.slug ? `/tournaments/${e.slug}` : "/"} className={`sm-sch-row${e.soon ? " soon" : ""}`}>
            <span className="sm-sch-dot" />
            <div className="sm-sch-date">{e.date}</div>
            <div className="sm-sch-name">{e.flag} {e.name}</div>
            <div className="sm-sch-meta">{e.grade} · {e.city}</div>
            {e.bwfUrl && (
              <a
                href={e.bwfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm-sch-bwf"
                onClick={(ev) => ev.stopPropagation()}
              >
                Live on BWF ↗
              </a>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ title, cta, to }) {
  return (
    <div className="sm-h">
      <h2 className="sm-h-title">{title}</h2>
      {cta && <Link to={to} className="sm-h-cta">{cta} →</Link>}
    </div>
  );
}

function MobileFeatured({ event, players }) {
  const status = useStatus(event.startsAt, event.endsAt);
  if (!status || status.phase === "after") return null;
  const list = (event.indiaContingent ?? [])
    .map((c) => c.playerSlug && players.find((p) => p.slug === c.playerSlug))
    .filter(Boolean);
  const showPhotos = list.slice(0, 5);
  const overflow = Math.max(0, (event.indiaContingent?.length ?? 0) - showPhotos.length);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <Link to={`/tournaments/${event.slug}`} className="sm-featured" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="sm-featured-kicker">FEATURED · {event.grade?.split("·").pop().trim().toUpperCase()}</div>
      <h3 className="sm-featured-title">{event.flag} {event.name} {event.edition}</h3>
      <div className="sm-featured-sub">{event.city} · {event.venue?.name ?? ""}</div>
      <div className="sm-featured-row">
        <div className="sm-featured-status">
          {status.phase === "during" ? (
            <>
              <span className="top">
                <span className="bc-livedot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bc-live)", boxShadow: "0 0 8px var(--bc-live)" }} />
                ON COURT
              </span>
              <span className="val bc-num">DAY {status.dayNumber} <span style={{ opacity: .5, fontSize: 14 }}>of {status.totalDays}</span></span>
            </>
          ) : (
            <>
              <span className="top">STARTS IN</span>
              <span className="val bc-num">{pad(status.days)}d : {pad(status.hours)}h : {pad(status.minutes)}m</span>
            </>
          )}
        </div>
        <div className="sm-avatars">
          {showPhotos.map((p) => {
            const photo = PLAYER_PHOTOS[p.photo];
            return (
              <div key={p.slug}>
                {photo && <img src={photo} alt={p.name} style={{ objectPosition: p.pos ?? "center top" }} />}
              </div>
            );
          })}
          {overflow > 0 && <div>+{overflow}</div>}
        </div>
      </div>
    </Link>
  );
}

function MobileFresh({ data }) {
  const winner = data?.winner?.trim() ?? "";
  const loser = data?.loser?.trim() ?? "";
  const usable = data && data.tag &&
    !PLACEHOLDER.test(winner) && !PLACEHOLDER.test(loser) &&
    winner.toLowerCase() !== loser.toLowerCase();
  const r = usable ? data : SEED_FRESH_RESULT;
  return (
    <div className="sm-fresh">
      <span className="sm-fresh-tag">🏆 {r.tag}</span>
      <div className="sm-fresh-line">
        {r.winner} <span className="beat">beat {r.loser}</span>{" "}
        <b className="bc-num sm-fresh-score">{r.score}</b>
      </div>
      <div className="sm-fresh-meta">{(r.event || "").toUpperCase()} · {(r.when || "").toUpperCase()}</div>
    </div>
  );
}
