import { useParams, Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_SCHEDULE, SEED_NEXT_EVENT } from "../data/seed.js";

export function TournamentDetail() {
  const { slug } = useParams();
  const { data: schedule } = usePolledJson("/data/schedule.json", { seed: SEED_SCHEDULE });
  const { data: nextEvent } = usePolledJson("/data/next-event.json", { seed: SEED_NEXT_EVENT });

  const event = (schedule || []).find((e) => e.slug === slug);

  if (!event) {
    return (
      <>
        <PageHead crumb={[{ label: "Home", to: "/" }, { label: "Tournaments" }]} eyebrow="NOT FOUND" title="Tournament not on calendar" />
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 0 96px" }}>
          <Link to="/" className="bc-cta" style={{ fontFamily: "var(--bc-sans)", fontSize: 14, color: "var(--bc-sub)" }}>← Back home</Link>
        </div>
      </>
    );
  }

  // For the "next" event we have richer detail in nextEvent.
  const detail = event.soon && nextEvent ? { ...event, ...nextEvent } : event;

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "Tournaments" }, { label: detail.name }]}
        eyebrow={`${detail.flag ?? ""} ${detail.grade} · ${detail.city ?? detail.country ?? ""}`}
        title={detail.name}
        dek={detail.blurb}
      />

      <section style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
          <Stat label="Dates"          value={detail.dates ?? detail.date} />
          <Stat label="Venue"          value={detail.venue ?? "—"} />
          <Stat label="India in draw"  value={detail.indiaInDraw != null ? `${detail.indiaInDraw} players` : "TBA"} />
          <Stat label="Broadcaster"    value={detail.broadcaster ?? "TBA"} />
        </div>

        {detail.bwfUrl && (
          <div style={{ maxWidth: 1320, margin: "26px auto 0", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <a
              href={detail.bwfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bc-btn bc-accentbtn"
              style={{ display: "inline-block", fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 14, color: "var(--bc-bg)", background: "var(--bc-accent)", border: "none", padding: "13px 24px", borderRadius: 7, textDecoration: "none" }}
            >
              Live scores & draws on BWF ↗
            </a>
            <span style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)" }}>
              We don't carry in-play scoring — official BWF page has every match.
            </span>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontFamily: "var(--bc-sans)", fontSize: 10, letterSpacing: "0.14em", color: "var(--bc-sub)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22, letterSpacing: "0.01em" }}>{value}</div>
    </div>
  );
}
