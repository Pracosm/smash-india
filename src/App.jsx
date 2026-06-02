import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { Home } from "./routes/Home.jsx";
import { NewsIndex } from "./routes/NewsIndex.jsx";
import { Article } from "./routes/Article.jsx";
import { Tournaments } from "./routes/Tournaments.jsx";
import { TournamentDetail } from "./routes/TournamentDetail.jsx";
import { PlayersIndex } from "./routes/PlayersIndex.jsx";
import { PlayerProfile } from "./routes/PlayerProfile.jsx";
import { Rankings } from "./routes/Rankings.jsx";
import { NotFound } from "./routes/NotFound.jsx";

// Sunset palette — the prototype's chosen default: pink accent on dusky-teal night.
const MOOD = {
  bg: "#06192C", panel: "#0E3A60", panel2: "#16507F", sub: "#A6BFD4",
  line: "rgba(255,255,255,0.12)",
};

const VARS = {
  "--bc-bg": MOOD.bg,
  "--bc-panel": MOOD.panel,
  "--bc-panel2": MOOD.panel2,
  "--bc-sub": MOOD.sub,
  "--bc-line": MOOD.line,
  "--bc-text": "#EAF3EC",
  "--bc-accent": "#FF3D8B",
  "--bc-accent2": "#EAEAD0",
  "--bc-live": "#FF3B30",
  "--bc-cond": '"Saira Condensed", sans-serif',
  "--bc-sans": '"Space Grotesk", system-ui, sans-serif',
  "--bc-body": '"Saira", system-ui, sans-serif',
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    document.body.style.background = MOOD.bg;
  }, []);

  const textureBg = [
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 4px)",
    "radial-gradient(130% 120% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)",
  ].join(", ");
  const textureSize = ["100% 4px", "100% 100%"].join(", ");

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="smash-bc" style={{ ...VARS, background: "var(--bc-bg)", color: "var(--bc-text)", minHeight: "100vh", position: "relative", fontFamily: "var(--bc-body)" }}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsIndex />} />
          <Route path="/news/:slug" element={<Article />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:slug" element={<TournamentDetail />} />
          <Route path="/players" element={<PlayersIndex />} />
          <Route path="/players/:slug" element={<PlayerProfile />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <div className="bc-texture" style={{ backgroundImage: textureBg, backgroundSize: textureSize, opacity: 0.85 }} />
      </div>
    </BrowserRouter>
  );
}
