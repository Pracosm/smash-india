import { Hero } from "../components/Hero.jsx";
import { FreshResult } from "../components/FreshResult.jsx";
import { Players } from "../components/Players.jsx";
import { RankingsNews } from "../components/RankingsNews.jsx";
import { Schedule } from "../components/Schedule.jsx";

export function Home() {
  return (
    <>
      <Hero />
      <FreshResult />
      <Players />
      <RankingsNews />
      <Schedule />
    </>
  );
}
