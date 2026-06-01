import { Link } from "react-router-dom";

// Page header used on non-home routes. Replaces the home Hero — sits below the
// fixed Nav (which is transparent on home, blurred elsewhere via scroll).
export function PageHead({ eyebrow, title, dek, accent = "var(--bc-accent)", crumb }) {
  return (
    <section style={{ paddingTop: 110, paddingBottom: 26, borderBottom: "1px solid var(--bc-line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {crumb && (
          <div style={{ fontFamily: "var(--bc-sans)", fontSize: 12, color: "var(--bc-sub)", marginBottom: 14, letterSpacing: "0.04em" }}>
            {crumb.map((c, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>}
                {c.to ? <Link to={c.to} style={{ color: "var(--bc-sub)", textDecoration: "none" }} className="bc-cta">{c.label}</Link> : c.label}
              </span>
            ))}
          </div>
        )}
        {eyebrow && (
          <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", color: accent, marginBottom: 12 }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: "clamp(38px, 5.5vw, 72px)", lineHeight: 0.92, letterSpacing: "0.005em", margin: 0, textTransform: "uppercase" }}>
          {title}
        </h1>
        {dek && (
          <p style={{ fontFamily: "var(--bc-body)", fontSize: 16, color: "var(--bc-sub)", maxWidth: 720, marginTop: 14, lineHeight: 1.5 }}>
            {dek}
          </p>
        )}
      </div>
    </section>
  );
}
