import { useEffect, useState } from "react";

// Fetches a static JSON file at /data/*.json ONCE on mount. Returns the
// latest successful value, or the seed fallback if the fetch hasn't landed
// yet (or fails outright).
//
// Originally polled on an interval — dropped since match data isn't truly
// live. The pipeline commits → Vercel rebuilds → next page load gets fresh
// data. The intervalMs option is accepted but ignored (kept for back-compat).

export function usePolledJson(path, { seed = null } = {}) {
  const [data, setData] = useState(seed);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`${path} → ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setLastUpdated(new Date());
      } catch {
        // keep seed / last-known-good
      }
    })();
    return () => { cancelled = true; };
  }, [path]);

  return { data, lastUpdated };
}
