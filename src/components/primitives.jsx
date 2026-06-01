export function BcShuttle({ size = 28, color = "var(--bc-text)", tip = "var(--bc-accent)", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} aria-hidden="true">
      <circle cx="16" cy="25" r="5" fill={tip} />
      <path d="M16 23 L7 6 M16 23 L12 5 M16 23 L16 4 M16 23 L20 5 M16 23 L25 6"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 11 L22.5 11 M8 16 L24 16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function BcLogo({ size = 30, feather = "var(--bc-text)", dot = "var(--bc-accent)", style }) {
  return (
    <svg height={size} width={(size * 524) / 410} viewBox="0 158 524 410" fill="none" style={style} aria-label="Smash logo">
      <path d="M263.323 335.818C336.93 401.726 256.763 546.343 180.68 565.161C136.774 522.957 442.451 309.791 48.4664 446.537C98.6994 421.628 167.708 391.928 214.951 361.291C162.391 371.008 42.6817 404.548 0 387.02C28.8875 343.9 161.5 328.97 227 328.97C242.5 328.97 249 328.97 263.323 335.818Z" fill={feather} />
      <path d="M398.935 164.837C478.459 164.922 528.07 251.063 488.234 319.89L482.468 329.853C440.069 403.109 334.269 402.996 292.027 329.65C249.785 256.304 302.783 164.735 387.423 164.825L398.935 164.837Z" fill={dot} />
    </svg>
  );
}

export function BcPhoto({ label = "PHOTO", style, children, glow = true, className }) {
  return (
    <div className={className} style={{
      position: "relative", overflow: "hidden", background: "#0a1812",
      display: "flex", alignItems: "flex-end", ...style,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "repeating-linear-gradient(118deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 44px)" +
          (glow ? ", radial-gradient(120% 120% at 72% 0%, var(--bc-accent), transparent 58%)" : ""),
        opacity: glow ? 0.9 : 1,
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.12,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.4px)",
        backgroundSize: "13px 13px", mixBlendMode: "overlay",
      }} />
      {children}
      {label && (
        <div style={{
          position: "absolute", left: 14, top: 12,
          fontFamily: "var(--bc-cond)", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.26)",
          padding: "3px 7px", borderRadius: 2,
        }}>{label}</div>
      )}
    </div>
  );
}

export function BcFlag({ code }) {
  const isIndia = code === "IND";
  return (
    <span style={{
      fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em",
      color: isIndia ? "var(--bc-bg)" : "var(--bc-sub)",
      background: isIndia ? "var(--bc-accent2)" : "transparent",
      border: isIndia ? "none" : "1px solid var(--bc-line)",
      padding: "2px 6px", borderRadius: 3, minWidth: 34, textAlign: "center", display: "inline-block",
    }}>{code}</span>
  );
}

export function BcForm({ form }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {form.map((r, i) => (
        <span key={i} title={r === "W" ? "Win" : "Loss"} style={{
          width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--bc-sans)", fontWeight: 700, fontSize: 10,
          background: r === "W" ? "var(--bc-accent2)" : "rgba(255,255,255,0.08)",
          color: r === "W" ? "var(--bc-bg)" : "var(--bc-sub)",
        }}>{r}</span>
      ))}
    </div>
  );
}

export function BcHead({ children, cta, onCta, live }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      {live
        ? <span className="bc-livedot" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--bc-live)", display: "inline-block", boxShadow: "0 0 12px var(--bc-live)" }} />
        : <span style={{ width: 5, height: 22, background: "var(--bc-accent)", display: "inline-block", borderRadius: 2 }} />}
      <h3 style={{ fontFamily: "var(--bc-cond)", fontWeight: 800, fontSize: 24, letterSpacing: "0.03em", margin: 0, textTransform: "uppercase" }}>{children}</h3>
      {cta && <span className="bc-cta" style={{ marginLeft: "auto", fontFamily: "var(--bc-sans)", fontWeight: 600, fontSize: 13, color: "var(--bc-sub)", cursor: "pointer" }} onClick={onCta}>{cta} →</span>}
    </div>
  );
}
