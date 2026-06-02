import { Link } from "react-router-dom";
import { BcLogo } from "./primitives.jsx";

const LINKS = [
  { label: "Newsroom", to: "/news" },
  { label: "Players",  to: "/players" },
  { label: "Tournaments", to: "/tournaments" },
  { label: "Rankings", to: "/rankings" },
];

export function Footer() {
  return (
    <footer>
      <div className="bc-footer" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "30px 0 48px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <BcLogo size={24} />
          <span style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 22 }}>SMASH</span>
          <span style={{ fontFamily: "var(--bc-body)", fontSize: 12, color: "var(--bc-sub)", marginLeft: 8 }}>The home of Indian badminton.</span>
        </Link>
        <div style={{ display: "flex", gap: 22, fontFamily: "var(--bc-sans)", fontSize: 13, color: "var(--bc-sub)" }}>
          {LINKS.map((x) => (
            <Link key={x.label} to={x.to} className="bc-cta" style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>{x.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
