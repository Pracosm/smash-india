// Legacy aggregator — used by the home-page components for first paint.
// Live updates come from usePolledJson hooks that fetch /data/*.json at runtime.

import {
  SEED_LIVE, SEED_TODAY, SEED_RECENT, SEED_PLAYERS, SEED_NEWS,
  SEED_FRESH_RESULT, SEED_RANKINGS, SEED_SCHEDULE, SEED_NEXT_EVENT,
  PHOTO_CREDITS, PLAYER_PHOTOS,
} from "./seed.js";

// Resolve photo filenames to imported asset URLs.
const featuredWithPhotos = SEED_PLAYERS.map((p) => ({
  ...p,
  photo: PLAYER_PHOTOS[p.photo],
  photo2: p.photo2 ? PLAYER_PHOTOS[p.photo2] : undefined,
}));

export const BC_DATA = {
  live: SEED_LIVE,
  today: SEED_TODAY,
  recent: SEED_RECENT,
  featured: featuredWithPhotos,
  news: SEED_NEWS,
  freshResult: SEED_FRESH_RESULT,
  rankings: SEED_RANKINGS,
  schedule: SEED_SCHEDULE,
  nextEvent: SEED_NEXT_EVENT,
  photoCredits: PHOTO_CREDITS,
};
