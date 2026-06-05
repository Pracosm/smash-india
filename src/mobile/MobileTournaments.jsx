import { Link } from "react-router-dom";
import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_SCHEDULE } from "../data/seed.js";
import { MobilePageHead } from "./MobileNav.jsx";

export function MobileTournaments() {
  const { data: schedule } = usePolledJson("/data/schedule.json", { seed: SEED_SCHEDULE });
  const events = (Array.isArray(schedule) && schedule.length > 0) ? schedule : SEED_SCHEDULE;

  return (
    <div>
      <MobilePageHead
        eyebrow="BWF WORLD TOUR · 2026"
        title="The calendar"
        dek="Every upcoming BWF event on India's radar."
      />
      <div className="sm-tourn-list" style={{ paddingTop: 16 }}>
        {events.map((e) => (
          <Link
            key={e.slug ?? e.name}
            to={e.slug ? `/tournaments/${e.slug}` : "/"}
            className={`sm-tourn-card${e.soon ? " soon" : ""}`}
          >
            {e.soon && <span className="sm-tourn-tag">NEXT UP</span>}
            <div className="sm-tourn-date">{e.date}</div>
            <div className="sm-tourn-name">{e.flag} {e.name}</div>
            <div className="sm-tourn-meta">{e.grade} · {e.city}</div>
            {e.bwfUrl && (
              <a
                href={e.bwfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(ev) => ev.stopPropagation()}
                className="sm-sch-bwf"
                style={{ marginTop: 12 }}
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
