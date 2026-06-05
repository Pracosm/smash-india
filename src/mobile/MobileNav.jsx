import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BcLogo } from "../components/primitives.jsx";

const TABS = [
  { label: "Home",        to: "/",            icon: "⌂", match: (p) => p === "/" },
  { label: "Events",      to: "/tournaments", icon: "◈", match: (p) => p.startsWith("/tournaments") },
  { label: "Players",     to: "/players",     icon: "✦", match: (p) => p.startsWith("/players") },
  { label: "Rankings",    to: "/rankings",    icon: "▤", match: (p) => p === "/rankings" },
  { label: "News",        to: "/news",        icon: "❒", match: (p) => p.startsWith("/news") },
];

export function MobileTopBar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header className={`sm-topbar${transparent ? " sm-transparent" : ""}`}>
      <Link to="/" className="sm-topbar-logo">
        <BcLogo size={22} />
        <span className="sm-wordmark">SMASH</span>
        <span className="sm-sub">INDIA</span>
      </Link>
      <div className="sm-topbar-right">
        <button type="button" aria-label="Search" className="sm-icon-btn">⌕</button>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="sm-tabbar" aria-label="Primary">
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link key={t.label} to={t.to} className={`sm-tab${active ? " active" : ""}`}>
            <span className="sm-tab-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobilePageHead({ eyebrow, title, dek, back }) {
  return (
    <section className="sm-pagehead">
      {back && (
        <Link to={back.to} className="sm-back">← {back.label}</Link>
      )}
      {eyebrow && <div className="sm-pagehead-eyebrow">{eyebrow}</div>}
      <h1 className="sm-pagehead-title">{title}</h1>
      {dek && <p className="sm-pagehead-dek">{dek}</p>}
    </section>
  );
}
