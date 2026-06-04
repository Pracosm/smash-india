import { usePolledJson } from "../hooks/usePolledJson.js";
import { SEED_FRESH_RESULT } from "../data/seed.js";

// Defensive sanity check on Gemini's extraction. If the pipeline returns
// a placeholder ("Opponent", "Opponent of X", "TBD", "Unknown"), or the
// same name on both sides, fall back to the seed so the strap never reads
// "Opponent of X beat X 21–18, 21–16".
const PLACEHOLDER = /(^|\b)(opponent|tbd|unknown|n\/?a)\b/i;

export function FreshResult() {
  const { data } = usePolledJson("/data/fresh-result.json", { seed: SEED_FRESH_RESULT });
  const winner = data?.winner?.trim() ?? "";
  const loser = data?.loser?.trim() ?? "";
  const usable = data && typeof data === "object" && data.tag &&
    !PLACEHOLDER.test(winner) && !PLACEHOLDER.test(loser) &&
    winner.toLowerCase() !== loser.toLowerCase();
  const r = usable ? data : SEED_FRESH_RESULT;
  return (
    <section style={{ background: "linear-gradient(90deg, var(--bc-accent2) 0%, color-mix(in srgb, var(--bc-accent2) 55%, var(--bc-bg)) 100%)", color: "var(--bc-bg)" }}>
      <div className="bc-fresh" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, padding: "16px 0" }}>
        <span style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", background: "var(--bc-bg)", color: "var(--bc-accent2)", padding: "6px 12px", borderRadius: 4 }}>🏆 {r.tag}</span>
        <div style={{ fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 17 }}>
          {r.winner} <span style={{ fontWeight: 500, opacity: 0.75 }}>beat {r.loser}</span>{" "}
          <b className="bc-num" style={{ marginLeft: 6 }}>{r.score}</b>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 13, opacity: 0.8, letterSpacing: "0.04em" }}>{r.event.toUpperCase()} · {r.when.toUpperCase()}</span>
      </div>
    </section>
  );
}
