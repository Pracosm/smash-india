import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BcLogo } from "./primitives.jsx";

// `match` says when this pill is "active". Items without a dedicated page
// link to home, but are NOT active on home — only on detail routes that
// belong to them (/tournaments/:slug, /players/:slug). Avoids 3-way highlight.
const PAGES = [
  { label: "Live",        to: "/",          match: (p) => p === "/" },
  { label: "Tournaments", to: "/",          match: (p) => p.startsWith("/tournaments") },
  { label: "Players",     to: "/",          match: (p) => p.startsWith("/players") },
  { label: "Rankings",    to: "/rankings",  match: (p) => p === "/rankings" },
  { label: "News",        to: "/news",      match: (p) => p.startsWith("/news") },
];

export function Nav() {
  const [follow, setFollow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Transparent only at the top of the home page; opaque + nav-visible everywhere else.
  const isHome = pathname === "/";
  const shown = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.66);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: shown ? "color-mix(in srgb, var(--bc-bg) 82%, transparent)" : "transparent",
      backdropFilter: shown ? "blur(12px)" : "none",
      WebkitBackdropFilter: shown ? "blur(12px)" : "none",
      borderBottom: shown ? "1px solid var(--bc-line)" : "1px solid transparent",
      transition: "border-color .4s",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit", filter: shown ? "none" : "drop-shadow(0 2px 12px rgba(0,0,0,0.6))", transition: "filter .4s" }}>
          <BcLogo size={32} />
          <span style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 30, letterSpacing: "0.01em", textShadow: shown ? "none" : "0 1px 12px rgba(0,0,0,0.5)" }}>SMASH</span>
          <span style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.22em", color: "var(--bc-accent2)", marginTop: 4 }}>INDIA</span>
        </Link>
        <div style={{
          display: "flex", alignItems: "center", gap: 24,
          opacity: shown ? 1 : 0,
          pointerEvents: shown ? "auto" : "none",
          transform: shown ? "translateY(0)" : "translateY(-6px)",
          transition: "opacity .35s, transform .35s",
        }}>
          <nav style={{ display: "flex", gap: 4, fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 14 }}>
            {PAGES.map((p) => {
              const active = p.match(pathname);
              return (
                <Link key={p.label} to={p.to} className="bc-pill" style={{
                  textDecoration: "none",
                  padding: "9px 16px", borderRadius: 100,
                  color: active ? "var(--bc-bg)" : "var(--bc-sub)",
                  background: active ? "var(--bc-accent2)" : "transparent",
                  fontWeight: active ? 700 : 600,
                }}>{p.label}</Link>
              );
            })}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "var(--bc-sans)", fontSize: 13, color: "var(--bc-sub)", cursor: "pointer" }}>⌕ Search</span>
            <button onClick={() => setFollow((f) => !f)} className="bc-btn bc-accentbtn" style={{
              fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 100, border: "none",
              color: follow ? "var(--bc-text)" : "var(--bc-bg)",
              background: follow ? "var(--bc-panel2)" : "var(--bc-accent)",
              outline: follow ? "1px solid var(--bc-accent)" : "none",
            }}>{follow ? "✓ Following India" : "★ Follow India"}</button>
          </div>
        </div>
      </div>
    </header>
  );
}
