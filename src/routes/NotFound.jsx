import { Link } from "react-router-dom";
import { PageHead } from "../components/PageHead.jsx";

export function NotFound() {
  return (
    <>
      <PageHead
        crumb={[{ label: "Home", to: "/" }, { label: "404" }]}
        eyebrow="404"
        title="Wide of the line"
        dek="The page you're after isn't here. Maybe it moved, maybe it never existed."
      />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 0 96px", display: "flex", gap: 14 }}>
        <Link to="/" className="bc-btn bc-accentbtn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 14, color: "var(--bc-bg)", background: "var(--bc-accent)", border: "none", padding: "12px 22px", borderRadius: 7, textDecoration: "none" }}>← Back home</Link>
        <Link to="/news" className="bc-btn" style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 14, color: "var(--bc-text)", background: "transparent", border: "1.5px solid var(--bc-line)", padding: "12px 22px", borderRadius: 7, textDecoration: "none" }}>Visit newsroom</Link>
      </div>
    </>
  );
}
