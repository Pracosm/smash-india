import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { usePolledJson } from "../hooks/usePolledJson.js";
import {
  SEED_FEATURED_EVENT, SEED_PLAYERS, SEED_NEWS, PLAYER_PHOTOS,
} from "../data/seed.js";

function useEventCountdown(startIso, endIso) {
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
    const days = Math.floor(d / 86_400_000); d -= days * 86_400_000;
    const hours = Math.floor(d / 3_600_000); d -= hours * 3_600_000;
    const minutes = Math.floor(d / 60_000); d -= minutes * 60_000;
    const seconds = Math.floor(d / 1000);
    return { phase: "before", days, hours, minutes, seconds };
  }
  if (now > end) return { phase: "after" };
  const totalDays = Math.max(1, Math.ceil((end - start) / 86_400_000));
  const dayNumber = Math.min(totalDays, Math.floor((now - start) / 86_400_000) + 1);
  return { phase: "during", dayNumber, totalDays };
}

export function IndonesiaOpenPage() {
  const { data: event } = usePolledJson("/data/featured-event.json", { seed: SEED_FEATURED_EVENT });
  const { data: players } = usePolledJson("/data/players.json", { seed: SEED_PLAYERS });
  const { data: news } = usePolledJson("/data/news.json", { seed: SEED_NEWS });
  const { data: articles } = usePolledJson("/data/articles.json", { seed: [] });
  const status = useEventCountdown(event?.startsAt, event?.endsAt);

  if (!event) return null;

  const pad = (n) => String(n).padStart(2, "0");

  // Related coverage — anything with "indonesia" in title/summary/tags.
  const matches = (item) => {
    const hay = `${item.title ?? ""} ${item.summary ?? ""} ${item.indian_angle ?? ""} ${item.dek ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
    return hay.includes("indonesia");
  };
  const related = [
    ...(articles ?? []).filter(matches).map((a) => ({ ...a, isArticle: true })),
    ...(news ?? []).filter(matches),
  ].slice(0, 6);

  return (
    <>
      {/* ───────── Hero strip ───────── */}
      <section style={{ paddingTop: 110, paddingBottom: 36, borderBottom: "1px solid var(--bc-line)", background: "linear-gradient(180deg, color-mix(in srgb, var(--bc-accent) 14%, transparent), transparent 70%)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--bc-sans)", fontSize: 12, color: "var(--bc-sub)", marginBottom: 14, letterSpacing: "0.04em" }}>
            <Link to="/" className="bc-cta" style={{ color: "var(--bc-sub)", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
            <Link to="/tournaments" className="bc-cta" style={{ color: "var(--bc-sub)", textDecoration: "none" }}>Tournaments</Link>
            <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
            <span>{event.name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {status.phase === "during" && (
              <span className="bc-livedot" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, color: "var(--bc-live)", letterSpacing: "0.14em", border: "1px solid var(--bc-live)", padding: "4px 10px", borderRadius: 3 }}>● ON COURT · DAY {status.dayNumber} of {status.totalDays}</span>
            )}
            <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: "var(--bc-bg)", background: "var(--bc-accent2)", padding: "5px 11px", borderRadius: 3 }}>FEATURED EVENT</span>
            <span style={{ fontFamily: "var(--bc-sans)", fontSize: 13, color: "var(--bc-sub)", letterSpacing: "0.04em" }}>{event.grade}</span>
          </div>

          <h1 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 0.92, margin: "0 0 14px", textTransform: "uppercase" }}>
            {event.flag} {event.name} <span style={{ color: "var(--bc-accent)" }}>{event.edition}</span>
          </h1>
          <div style={{ fontFamily: "var(--bc-body)", fontSize: 17, color: "var(--bc-sub)", maxWidth: 760, lineHeight: 1.5, marginBottom: 24 }}>
            {event.dates} · {event.city} · {event.venue?.name} {event.fullName && <><br/><span style={{ fontSize: 13, opacity: 0.8 }}>{event.fullName}</span></>}
          </div>

          {status.phase !== "after" && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: "var(--bc-text)", opacity: 0.7 }}>
                {status.phase === "before" ? "STARTS IN" : "FINISHES IN"}
              </span>
              <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 30, letterSpacing: "0.03em", color: "var(--bc-text)" }}>
                {status.phase === "before"
                  ? <>{pad(status.days)}<span style={{ fontSize: 14, opacity: 0.65, marginLeft: 1 }}>d</span> <span style={{ opacity: 0.35, margin: "0 6px" }}>:</span>
                     {pad(status.hours)}<span style={{ fontSize: 14, opacity: 0.65, marginLeft: 1 }}>h</span> <span style={{ opacity: 0.35, margin: "0 6px" }}>:</span>
                     {pad(status.minutes)}<span style={{ fontSize: 14, opacity: 0.65, marginLeft: 1 }}>m</span> <span style={{ opacity: 0.35, margin: "0 6px" }}>:</span>
                     {pad(status.seconds)}<span style={{ fontSize: 14, opacity: 0.65, marginLeft: 1 }}>s</span></>
                  : `${status.totalDays - status.dayNumber}d`}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={event.bwfUrl} target="_blank" rel="noopener noreferrer" className="bc-btn bc-accentbtn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 15, color: "var(--bc-bg)", background: "var(--bc-accent)", border: "none", padding: "14px 24px", borderRadius: 7, textDecoration: "none" }}>
              Live draws & scores on BWF ↗
            </a>
            <a href="#watch" className="bc-btn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 15, color: "var(--bc-text)", background: "transparent", border: "1.5px solid var(--bc-line)", padding: "14px 22px", borderRadius: 7, textDecoration: "none" }}>
              How to watch in India ↓
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Key facts ───────── */}
      <section style={{ paddingTop: 36, paddingBottom: 36, borderBottom: "1px solid var(--bc-line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          <Fact label="Prize money"   value={event.prizeMoneyUsd ? `$${(event.prizeMoneyUsd/1_000_000).toFixed(2)}M` : "TBA"} sub="USD total" />
          <Fact label="Grade"         value={event.grade ?? "—"} sub="BWF World Tour" />
          <Fact label="Draw size"     value={`${event.drawSize ?? 32}`} sub="per discipline" />
          <Fact label="Disciplines"   value={`${event.disciplines ?? 5}`} sub="MS · WS · MD · WD · XD" />
          <Fact label="India in draw" value={`${event.indiaContingent?.length ?? 0}`} sub="across disciplines" />
          <Fact label="Venue"         value={event.venue?.name ?? "—"} sub={event.venue?.capacity ? `cap ${event.venue.capacity.toLocaleString()}` : ""} />
        </div>
      </section>

      {/* ───────── Stakes + summary ───────── */}
      {(event.stakes || event.summary) && (
        <section style={{ paddingTop: 48, paddingBottom: 48, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--bc-accent)", marginBottom: 12 }}>WHAT'S AT STAKE FOR INDIA</div>
            {event.stakes && <p style={{ fontFamily: "var(--bc-body)", fontSize: 22, lineHeight: 1.35, color: "var(--bc-text)", margin: "0 0 22px", fontWeight: 500, textWrap: "pretty" }}>{event.stakes}</p>}
            {event.summary && (
              <div className="bc-prose" style={{ fontFamily: "var(--bc-body)", fontSize: 16, lineHeight: 1.65, color: "var(--bc-text)" }}>
                <ReactMarkdown>{event.summary}</ReactMarkdown>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ───────── India contingent ───────── */}
      {event.indiaContingent?.length > 0 && (
        <section style={{ paddingTop: 48, paddingBottom: 48, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <SectionTitle eyebrow="The Indian contingent">9 in the draw</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {event.indiaContingent.map((c, i) => {
                const player = c.playerSlug && (players ?? []).find((p) => p.slug === c.playerSlug);
                const photo = player && PLAYER_PHOTOS[player.photo];
                const photo2 = player?.photo2 && PLAYER_PHOTOS[player.photo2];
                const inner = (
                  <div className="bc-card bc-contingent-row" style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 12, padding: "14px 16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", background: "var(--bc-bg)", display: "flex", flexShrink: 0 }}>
                      {photo2 ? (
                        <>
                          <img src={photo} alt="" style={{ width: "50%", height: "100%", objectFit: "cover", objectPosition: player.pos ?? "center top" }} />
                          <img src={photo2} alt="" style={{ width: "50%", height: "100%", objectFit: "cover", objectPosition: player.pos2 ?? "center top" }} />
                        </>
                      ) : photo ? (
                        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: player.pos ?? "center top" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--bc-panel2), var(--bc-bg))" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17 }}>{c.name}</span>
                        {c.seed != null && <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", color: "var(--bc-accent)", border: "1px solid var(--bc-accent)", padding: "1px 6px", borderRadius: 3 }}>SEED {c.seed}</span>}
                      </div>
                      <div style={{ fontFamily: "var(--bc-sans)", fontSize: 12, color: "var(--bc-sub)", marginTop: 4 }}>
                        {c.discipline} · World #{c.rank}
                      </div>
                      <div style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-text)", marginTop: 6, opacity: 0.9 }}>
                        {c.draw}
                      </div>
                      {c.note && <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 4, fontStyle: "italic" }}>{c.note}</div>}
                    </div>
                    {c.playerSlug && (
                      <span className="bc-cta bc-contingent-chev" style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 12, color: "var(--bc-sub)" }}>Profile →</span>
                    )}
                  </div>
                );
                return c.playerSlug
                  ? <Link key={i} to={`/players/${c.playerSlug}`} style={{ textDecoration: "none", color: "inherit" }}>{inner}</Link>
                  : <div key={i}>{inner}</div>;
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────── India history at this event ───────── */}
      {event.indiaHistory?.length > 0 && (
        <section style={{ paddingTop: 48, paddingBottom: 48, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <SectionTitle eyebrow="India at Indonesia Open — past moments">India's hall of fame here</SectionTitle>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {event.indiaHistory.map((h, i) => (
                <li key={i} style={{ display: "flex", gap: 18, alignItems: "baseline", padding: "12px 0", borderBottom: i < event.indiaHistory.length - 1 ? "1px solid var(--bc-line)" : "none" }}>
                  <span className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 28, color: "var(--bc-accent2)", minWidth: 70 }}>{h.year}</span>
                  <span style={{ fontFamily: "var(--bc-body)", fontSize: 16, color: "var(--bc-text)", lineHeight: 1.4 }}>{h.result}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ───────── Recent champions ───────── */}
      {event.recentChampions?.length > 0 && (
        <section style={{ paddingTop: 48, paddingBottom: 48, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <SectionTitle eyebrow="Recent champions">Last 5 editions</SectionTitle>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--bc-sans)", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bc-panel)" }}>
                    {["Year", "Men's Singles", "Women's Singles", "Men's Doubles", "Women's Doubles", "Mixed Doubles"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "var(--bc-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--bc-line)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {event.recentChampions.map((r) => (
                    <tr key={r.year} style={{ borderBottom: "1px solid var(--bc-line)" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 18, color: "var(--bc-accent2)" }}>{r.year}</td>
                      <td style={{ padding: "12px 14px" }}>{highlightIndia(r.ms)}</td>
                      <td style={{ padding: "12px 14px" }}>{highlightIndia(r.ws)}</td>
                      <td style={{ padding: "12px 14px" }}>{highlightIndia(r.md)}</td>
                      <td style={{ padding: "12px 14px" }}>{highlightIndia(r.wd)}</td>
                      <td style={{ padding: "12px 14px" }}>{highlightIndia(r.xd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ───────── How to watch ───────── */}
      {event.broadcasters?.length > 0 && (
        <section id="watch" style={{ paddingTop: 48, paddingBottom: 48, borderBottom: "1px solid var(--bc-line)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <SectionTitle eyebrow="How to watch">Broadcast & streaming</SectionTitle>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {event.broadcasters.map((b, i) => (
                <div key={i} className="bc-card" style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "14px 20px", minWidth: 200 }}>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 16 }}>{b.label}</div>
                  <div style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginTop: 4 }}>{b.region}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Related coverage ───────── */}
      {related.length > 0 && (
        <section style={{ paddingTop: 48, paddingBottom: 72 }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <SectionTitle eyebrow="From the newsroom">Related coverage</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {related.map((item) => (
                <Link
                  key={item.slug ?? item.title}
                  to={item.slug ? `/news/${item.slug}` : "/news"}
                  className="bc-card"
                  style={{ display: "block", textDecoration: "none", color: "inherit", background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "14px 18px" }}
                >
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: item.isArticle ? "var(--bc-accent)" : "var(--bc-sub)", marginBottom: 6 }}>
                    {(item.kicker ?? (item.isArticle ? "EDITORIAL" : "NEWS")).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{item.title}</div>
                  <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)", marginTop: 8 }}>
                    {item.time ?? (item.publishedAt && new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }))}
                    {item.read && ` · ${item.read}`}
                    {item.readMinutes && ` · ${item.readMinutes} min read`}
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

function Fact({ label, value, sub }) {
  return (
    <div style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontFamily: "var(--bc-sans)", fontSize: 10, letterSpacing: "0.14em", color: "var(--bc-sub)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div className="bc-num" style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 24, letterSpacing: "0.01em", lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontFamily: "var(--bc-body)", fontSize: 11, color: "var(--bc-sub)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, eyebrow }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {eyebrow && <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: "var(--bc-accent)", marginBottom: 6 }}>{eyebrow.toUpperCase()}</div>}
      <h2 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 32, letterSpacing: "0.01em", textTransform: "uppercase", margin: 0 }}>{children}</h2>
    </div>
  );
}

function highlightIndia(text) {
  if (!text) return <span style={{ color: "var(--bc-sub)" }}>—</span>;
  const isIndia = /\(IND\)/.test(text);
  return (
    <span style={{ color: isIndia ? "var(--bc-accent)" : "var(--bc-text)", fontWeight: isIndia ? 700 : 500 }}>
      {text}
    </span>
  );
}
