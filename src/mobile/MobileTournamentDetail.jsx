import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { usePolledJson } from "../hooks/usePolledJson.js";
import {
  SEED_SCHEDULE, SEED_NEXT_EVENT, SEED_FEATURED_EVENT,
  SEED_PLAYERS, SEED_NEWS, PLAYER_PHOTOS,
} from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

function useStatus(startIso, endIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { phase: "unknown" };
  if (now < start) {
    let d = start - now;
    const days = Math.floor(d / 86400000); d -= days * 86400000;
    const hours = Math.floor(d / 3600000); d -= hours * 3600000;
    const minutes = Math.floor(d / 60000); d -= minutes * 60000;
    const seconds = Math.floor(d / 1000);
    return { phase: "before", days, hours, minutes, seconds };
  }
  if (now > end) return { phase: "after" };
  const totalDays = Math.max(1, Math.ceil((end - start) / 86400000));
  const dayNumber = Math.min(totalDays, Math.floor((now - start) / 86400000) + 1);
  return { phase: "during", dayNumber, totalDays };
}

export function MobileTournamentDetail() {
  const { slug } = useParams();
  const { data: schedule } = usePolledJson("/data/schedule.json", { seed: SEED_SCHEDULE });
  const { data: nextEvent } = usePolledJson("/data/next-event.json", { seed: SEED_NEXT_EVENT });
  const { data: featured } = usePolledJson("/data/featured-event.json", { seed: SEED_FEATURED_EVENT });

  const scheduleItem = (schedule || []).find((e) => e.slug === slug);
  const isFeatured = (featured && featured.slug === slug) || scheduleItem?.featured;

  if (isFeatured && featured) return <MobileFeaturedDetail event={featured} />;

  if (!scheduleItem) {
    return (
      <div>
        <MobilePageHead back={{ to: "/tournaments", label: "Tournaments" }} eyebrow="NOT FOUND" title="Not on calendar" />
      </div>
    );
  }
  const detail = scheduleItem.soon && nextEvent ? { ...scheduleItem, ...nextEvent } : scheduleItem;
  const venueName = typeof detail.venue === "string" ? detail.venue : (detail.venue?.name ?? "—");

  return (
    <div>
      <MobilePageHead
        back={{ to: "/tournaments", label: "Tournaments" }}
        eyebrow={`${detail.flag ?? ""} ${detail.grade} · ${detail.city ?? detail.country ?? ""}`}
        title={detail.name}
        dek={detail.blurb}
      />
      <div className="sm-td-facts">
        <Fact label="Dates" value={detail.dates ?? detail.date} />
        <Fact label="Venue" value={venueName} />
        <Fact label="India in draw" value={detail.indiaInDraw != null ? `${detail.indiaInDraw}` : "TBA"} />
        <Fact label="Broadcaster" value={detail.broadcaster ?? "TBA"} />
      </div>
      {detail.bwfUrl && (
        <div style={{ padding: "8px var(--pad) 32px" }}>
          <a
            href={detail.bwfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm-btn sm-btn-primary sm-btn-block"
          >
            Live scores & draws on BWF ↗
          </a>
          <p style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 10, lineHeight: 1.5 }}>
            We don't carry in-play scoring — official BWF page has every match.
          </p>
        </div>
      )}
    </div>
  );
}

function MobileFeaturedDetail({ event }) {
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const { data: news } = usePolledJson("/data/news.json", { seed: SEED_NEWS });
  const { data: articles } = usePolledJson("/data/articles.json", { seed: [] });
  const status = useStatus(event.startsAt, event.endsAt);
  const pad = (n) => String(n).padStart(2, "0");

  const matches = (item) => {
    const hay = `${item.title ?? ""} ${item.summary ?? ""} ${item.indian_angle ?? ""} ${item.dek ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
    return hay.includes(String(event.name ?? "").toLowerCase().split(" ")[0]);
  };
  const related = [
    ...(articles ?? []).filter(matches).map((a) => ({ ...a, isArticle: true })),
    ...(news ?? []).filter(matches),
  ].slice(0, 6);

  return (
    <div>
      <MobilePageHead
        back={{ to: "/tournaments", label: "Tournaments" }}
        eyebrow={event.grade}
        title={`${event.flag ?? ""} ${event.name} ${event.edition ?? ""}`}
        dek={`${event.dates} · ${event.city} · ${event.venue?.name ?? ""}`}
      />

      {status.phase !== "after" && status.phase !== "unknown" && (
        <div style={{ padding: "14px var(--pad) 0" }}>
          <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: ".18em", color: "var(--bc-text)", opacity: .7, marginBottom: 8 }}>
            {status.phase === "before" ? "STARTS IN" : `ON COURT · DAY ${status.dayNumber} OF ${status.totalDays}`}
          </div>
          {status.phase === "before" && (
            <div className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 28, letterSpacing: ".03em" }}>
              {pad(status.days)}<span style={{ fontSize: 14, opacity: .65 }}>d</span> :{" "}
              {pad(status.hours)}<span style={{ fontSize: 14, opacity: .65 }}>h</span> :{" "}
              {pad(status.minutes)}<span style={{ fontSize: 14, opacity: .65 }}>m</span> :{" "}
              {pad(status.seconds)}<span style={{ fontSize: 14, opacity: .65 }}>s</span>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "16px var(--pad) 4px", display: "flex", flexDirection: "column", gap: 10 }}>
        {event.bwfUrl && (
          <a href={event.bwfUrl} target="_blank" rel="noopener noreferrer" className="sm-btn sm-btn-primary sm-btn-block">
            Live draws & scores on BWF ↗
          </a>
        )}
        <a href="#watch" className="sm-btn sm-btn-block">How to watch in India ↓</a>
      </div>

      <div className="sm-td-facts">
        <Fact label="Prize money" value={event.prizeMoneyUsd ? `$${(event.prizeMoneyUsd/1_000_000).toFixed(2)}M` : "TBA"} />
        <Fact label="Grade" value={event.grade?.split("·").pop().trim() ?? "—"} />
        <Fact label="Draw size" value={`${event.drawSize ?? 32}`} />
        <Fact label="Disciplines" value={`${event.disciplines ?? 5}`} />
        <Fact label="India in draw" value={`${event.indiaContingent?.length ?? 0}`} />
        <Fact label="Venue cap" value={event.venue?.capacity ? event.venue.capacity.toLocaleString() : "—"} />
      </div>

      {(event.stakes || event.summary) && (
        <section style={{ padding: "12px var(--pad) 8px" }}>
          <div className="sm-news-kicker">WHAT'S AT STAKE FOR INDIA</div>
          {event.stakes && <p style={{ fontFamily: "var(--bc-body)", fontSize: 18, lineHeight: 1.4, fontWeight: 500, margin: "0 0 16px" }}>{event.stakes}</p>}
          {event.summary && (
            <div className="sm-article">
              <div className="prose" style={{ fontSize: 15 }}>
                <ReactMarkdown>{event.summary}</ReactMarkdown>
              </div>
            </div>
          )}
        </section>
      )}

      {event.indiaContingent?.length > 0 && (
        <section>
          <div className="sm-h"><h2 className="sm-h-title">India in the draw</h2></div>
          <div className="sm-td-contingent">
            {event.indiaContingent.map((c, i) => {
              const player = c.playerSlug && (players ?? []).find((p) => p.slug === c.playerSlug);
              const photo = player && PLAYER_PHOTOS[player.photo];
              const photo2 = player?.photo2 && PLAYER_PHOTOS[player.photo2];
              const body = (
                <div className="sm-td-row">
                  <div className={`sm-td-thumb${photo2 ? " split" : ""}`}>
                    {photo2 ? (
                      <>
                        <img src={photo} alt="" style={{ objectPosition: player.pos ?? "center top" }} />
                        <img src={photo2} alt="" style={{ objectPosition: player.pos2 ?? "center top" }} />
                      </>
                    ) : photo ? (
                      <img src={photo} alt="" style={{ objectPosition: player.pos ?? "center top" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--bc-panel2), var(--bc-bg))" }} />
                    )}
                  </div>
                  <div className="body">
                    <div className="name">
                      {c.name}
                      {c.seed != null && <span className="seed">SEED {c.seed}</span>}
                    </div>
                    <div className="disc">{c.discipline} · World #{c.rank}</div>
                    <div className="draw">{c.draw}</div>
                    {c.note && <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 4, fontStyle: "italic" }}>{c.note}</div>}
                  </div>
                </div>
              );
              return c.playerSlug
                ? <Link key={i} to={`/players/${c.playerSlug}`} style={{ textDecoration: "none", color: "inherit" }}>{body}</Link>
                : <div key={i}>{body}</div>;
            })}
          </div>
        </section>
      )}

      {event.indiaHistory?.length > 0 && (
        <section style={{ marginTop: 6 }}>
          <div className="sm-h"><h2 className="sm-h-title">India's hall of fame</h2></div>
          <ul style={{ listStyle: "none", padding: "0 var(--pad)", margin: 0 }}>
            {event.indiaHistory.map((h, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "12px 0", borderBottom: i < event.indiaHistory.length - 1 ? "1px solid var(--bc-line)" : "none" }}>
                <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22, color: "var(--bc-accent2)", minWidth: 58 }}>{h.year}</span>
                <span style={{ fontFamily: "var(--bc-body)", fontSize: 14, lineHeight: 1.4 }}>{h.result}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {event.recentChampions?.length > 0 && (
        <section>
          <div className="sm-h"><h2 className="sm-h-title">Recent champions</h2></div>
          <div style={{ overflowX: "auto", padding: "0 var(--pad) 8px", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontFamily: "var(--bc-sans)", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "var(--bc-panel)" }}>
                  {["Year", "MS", "WS", "MD", "WD", "XD"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 10, letterSpacing: ".08em", color: "var(--bc-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--bc-line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {event.recentChampions.map((r) => (
                  <tr key={r.year} style={{ borderBottom: "1px solid var(--bc-line)" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 15, color: "var(--bc-accent2)" }}>{r.year}</td>
                    <td style={{ padding: "10px 12px" }}>{hi(r.ms)}</td>
                    <td style={{ padding: "10px 12px" }}>{hi(r.ws)}</td>
                    <td style={{ padding: "10px 12px" }}>{hi(r.md)}</td>
                    <td style={{ padding: "10px 12px" }}>{hi(r.wd)}</td>
                    <td style={{ padding: "10px 12px" }}>{hi(r.xd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {event.broadcasters?.length > 0 && (
        <section id="watch">
          <div className="sm-h"><h2 className="sm-h-title">How to watch</h2></div>
          <div style={{ padding: "0 var(--pad)", display: "flex", flexDirection: "column", gap: 10 }}>
            {event.broadcasters.map((b, i) => (
              <div key={i} className="sm-stat">
                <div className="lbl">{b.region}</div>
                <div className="val" style={{ fontSize: 18 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <div className="sm-h"><h2 className="sm-h-title">Related coverage</h2></div>
          <div style={{ padding: "0 var(--pad)", display: "flex", flexDirection: "column", gap: 10 }}>
            {related.map((item) => (
              <Link
                key={item.slug ?? item.title}
                to={item.slug ? `/news/${item.slug}` : "/news"}
                className="sm-card"
                style={{ padding: "12px 14px" }}
              >
                <div className="sm-news-kicker">{(item.kicker ?? (item.isArticle ? "EDITORIAL" : "NEWS")).toUpperCase()}</div>
                <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{item.title}</div>
                <div className="sm-news-meta">
                  {item.time ?? (item.publishedAt && new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }))}
                  {item.read && ` · ${item.read}`}
                  {item.readMinutes && ` · ${item.readMinutes} min read`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="sm-stat">
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
    </div>
  );
}

function hi(text) {
  if (!text) return <span style={{ color: "var(--bc-sub)" }}>—</span>;
  const isIndia = /\(IND\)/.test(text);
  return (
    <span style={{ color: isIndia ? "var(--bc-accent)" : "var(--bc-text)", fontWeight: isIndia ? 700 : 500 }}>
      {text}
    </span>
  );
}
