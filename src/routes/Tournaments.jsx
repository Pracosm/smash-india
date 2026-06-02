import { Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_SCHEDULE } from "../data/seed.js";

export function Tournaments() {
  const { data: schedule } = usePolledJson("/data/schedule.json", { seed: SEED_SCHEDULE });
  const events = schedule ?? [];

  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "Tournaments" }]}
        eyebrow="BWF WORLD TOUR · 2026"
        title="The calendar"
        dek="Every upcoming BWF event on India's radar. Click through for venue, dates, draw size, and the live BWF page."
      />
      <section style={{ paddingTop: 36, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {events.map((e) => (
            <Link
              key={e.slug ?? e.name}
              to={e.slug ? `/tournaments/${e.slug}` : "/"}
              className="bc-card"
              style={{ display: "block", textDecoration: "none", color: "inherit", background: "var(--bc-panel)", border: "1px solid var(--bc-line)", borderRadius: 12, padding: "20px 22px", position: "relative", overflow: "hidden" }}
            >
              {e.soon && (
                <span style={{ position: "absolute", top: 14, right: 14, fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", color: "var(--bc-bg)", background: "var(--bc-accent)", padding: "4px 8px", borderRadius: 3 }}>
                  NEXT UP
                </span>
              )}
              <div style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 18, letterSpacing: "0.06em", color: e.soon ? "var(--bc-accent)" : "var(--bc-sub)", marginBottom: 8 }}>
                {e.date}
              </div>
              <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 22, lineHeight: 1.15, marginBottom: 6 }}>
                {e.flag} {e.name}
              </div>
              <div style={{ fontFamily: "var(--bc-body)", fontSize: 13, color: "var(--bc-sub)", marginBottom: 14 }}>
                {e.grade} · {e.city}
              </div>
              {e.bwfUrl && (
                <span
                  onClick={(ev) => { ev.preventDefault(); window.open(e.bwfUrl, "_blank", "noopener,noreferrer"); }}
                  className="bc-cta"
                  style={{ fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 12, color: "var(--bc-accent2)", letterSpacing: "0.04em", cursor: "pointer" }}
                >
                  Live on BWF ↗
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
