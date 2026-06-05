import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { MobileTopBar, MobileTabBar } from "./MobileNav.jsx";
import { MobileHome } from "./MobileHome.jsx";
import { MobileNews } from "./MobileNews.jsx";
import { MobileArticle } from "./MobileArticle.jsx";
import { MobileTournaments } from "./MobileTournaments.jsx";
import { MobileTournamentDetail } from "./MobileTournamentDetail.jsx";
import { MobilePlayers } from "./MobilePlayers.jsx";
import { MobilePlayerProfile } from "./MobilePlayerProfile.jsx";
import { MobileRankings } from "./MobileRankings.jsx";
import { MobileNotFound } from "./MobileNotFound.jsx";
import "./mobile.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export function MobileApp() {
  return (
    <div className="sm-mobile">
      <ScrollToTop />
      <MobileTopBar />
      <main className="sm-page">
        <Routes>
          <Route path="/" element={<MobileHome />} />
          <Route path="/news" element={<MobileNews />} />
          <Route path="/news/:slug" element={<MobileArticle />} />
          <Route path="/tournaments" element={<MobileTournaments />} />
          <Route path="/tournaments/:slug" element={<MobileTournamentDetail />} />
          <Route path="/players" element={<MobilePlayers />} />
          <Route path="/players/:slug" element={<MobilePlayerProfile />} />
          <Route path="/rankings" element={<MobileRankings />} />
          <Route path="*" element={<MobileNotFound />} />
        </Routes>
      </main>
      <MobileTabBar />
    </div>
  );
}
