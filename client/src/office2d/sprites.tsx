/**
 * SVG anime-style chibi character sprites for each agent role.
 * Each character is a detailed hand-drawn SVG illustration.
 */

interface SpriteProps {
  size?: number;
  glow?: string;
  className?: string;
  isActive?: boolean;
}

// ── Erwin (Planner) — Zen monk strategist with scroll ──
function PlannerSprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - brown robe */}
      <ellipse cx="32" cy="50" rx="14" ry="8" fill="#3d2b1a" />
      <rect x="20" y="30" width="24" height="22" rx="4" fill="#5c3d24" />
      <rect x="22" y="32" width="20" height="18" rx="3" fill="#6b4a2e" />
      {/* Robe sash */}
      <rect x="28" y="32" width="8" height="18" rx="2" fill="#8b6914" />
      {/* Head */}
      <circle cx="32" cy="22" r="12" fill="#f5d0a9" />
      {/* Bald head shine */}
      <ellipse cx="29" cy="16" rx="5" ry="3" fill="rgba(255,255,255,0.15)" />
      {/* Eyes */}
      <ellipse cx="27" cy="22" rx="2" ry={isActive ? 2.5 : 1.5} fill="#2a1a0a" />
      <ellipse cx="37" cy="22" rx="2" ry={isActive ? 2.5 : 1.5} fill="#2a1a0a" />
      {isActive && <>
        <circle cx="26" cy="21" r="0.8" fill="white" />
        <circle cx="36" cy="21" r="0.8" fill="white" />
      </>}
      {/* Peaceful smile */}
      <path d="M28 26 Q32 29 36 26" fill="none" stroke="#2a1a0a" strokeWidth="1" strokeLinecap="round" />
      {/* Scroll in hand */}
      <rect x="42" y="34" width="4" height="14" rx="2" fill="#f5e6d0" stroke="#c4a882" strokeWidth="0.5" />
      <circle cx="44" cy="34" r="2.5" fill="#f5e6d0" stroke="#c4a882" strokeWidth="0.5" />
      <circle cx="44" cy="48" r="2.5" fill="#f5e6d0" stroke="#c4a882" strokeWidth="0.5" />
      {/* Prayer beads */}
      {[0,1,2,3,4].map(i => (
        <circle key={i} cx={22 + i * 3} cy="30" r="1.2" fill="#4a3520" stroke="#6b5030" strokeWidth="0.3" />
      ))}
      {/* Sandals */}
      <ellipse cx="26" cy="54" rx="4" ry="2" fill="#3d2b1a" />
      <ellipse cx="38" cy="54" rx="4" ry="2" fill="#3d2b1a" />
    </svg>
  );
}

// ── Senku (Researcher) — Ninja scholar with book ──
function ResearcherSprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - dark navy outfit */}
      <ellipse cx="32" cy="50" rx="13" ry="7" fill="#1a1a3a" />
      <rect x="21" y="30" width="22" height="22" rx="3" fill="#2a2a5a" />
      {/* Cross-wrap belt */}
      <line x1="21" y1="32" x2="43" y2="48" stroke="#3a3a6a" strokeWidth="2" />
      <line x1="43" y1="32" x2="21" y2="48" stroke="#3a3a6a" strokeWidth="2" />
      {/* Head */}
      <circle cx="32" cy="22" r="11" fill="#f5d0a9" />
      {/* Hair - spiky */}
      <path d="M21 18 L24 8 L28 16 L32 6 L36 16 L40 8 L43 18" fill="#2a2a4a" />
      <path d="M21 18 Q32 14 43 18" fill="#2a2a4a" />
      {/* Red headband */}
      <rect x="20" y="15" width="24" height="3" rx="1" fill="#cc2200" />
      <path d="M44 15 L50 12 M44 18 L48 20" stroke="#cc2200" strokeWidth="2" strokeLinecap="round" />
      {/* Eyes - sharp */}
      <path d="M25 21 L30 21" stroke="#1a1a2a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 21 L39 21" stroke="#1a1a2a" strokeWidth="2.5" strokeLinecap="round" />
      {isActive && <>
        <circle cx="27" cy="20.5" r="0.8" fill="#4488ff" />
        <circle cx="37" cy="20.5" r="0.8" fill="#4488ff" />
      </>}
      {/* Focused mouth */}
      <line x1="29" y1="26" x2="35" y2="26" stroke="#2a1a0a" strokeWidth="0.8" strokeLinecap="round" />
      {/* Book in hand */}
      <rect x="8" y="36" width="12" height="10" rx="1" fill="#6688cc" stroke="#4466aa" strokeWidth="0.5" />
      <line x1="14" y1="36" x2="14" y2="46" stroke="#4466aa" strokeWidth="0.5" />
      <line x1="10" y1="39" x2="18" y2="39" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="10" y1="41" x2="18" y2="41" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="10" y1="43" x2="16" y2="43" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Sandals */}
      <ellipse cx="27" cy="54" rx="4" ry="2" fill="#1a1a2a" />
      <ellipse cx="37" cy="54" rx="4" ry="2" fill="#1a1a2a" />
    </svg>
  );
}

// ── Bulma (Coder) — Samurai with katana ──
function CoderSprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - red armor */}
      <ellipse cx="32" cy="50" rx="14" ry="8" fill="#660000" />
      <rect x="20" y="28" width="24" height="24" rx="3" fill="#8b0000" />
      {/* Armor plates */}
      <rect x="22" y="30" width="20" height="4" rx="1" fill="#aa1111" />
      <rect x="22" y="36" width="20" height="4" rx="1" fill="#aa1111" />
      <rect x="22" y="42" width="20" height="4" rx="1" fill="#aa1111" />
      {/* Shoulder guards */}
      <ellipse cx="18" cy="32" rx="5" ry="4" fill="#aa1111" stroke="#cc3333" strokeWidth="0.5" />
      <ellipse cx="46" cy="32" rx="5" ry="4" fill="#aa1111" stroke="#cc3333" strokeWidth="0.5" />
      {/* Head */}
      <circle cx="32" cy="18" r="11" fill="#f5d0a9" />
      {/* Kabuto helmet */}
      <path d="M20 16 Q32 4 44 16" fill="#ccaa00" stroke="#aa8800" strokeWidth="0.5" />
      <path d="M20 16 Q32 12 44 16" fill="#333333" />
      {/* Helmet crest */}
      <path d="M32 4 L32 0 L36 6" fill="#ccaa00" stroke="#aa8800" strokeWidth="0.5" />
      {/* Eyes - fierce */}
      <path d="M25 19 L30 18" stroke="#1a0a0a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 18 L39 19" stroke="#1a0a0a" strokeWidth="2.5" strokeLinecap="round" />
      {isActive && <>
        <circle cx="27" cy="18" r="0.8" fill="#ff4444" />
        <circle cx="37" cy="18" r="0.8" fill="#ff4444" />
      </>}
      {/* Determined mouth */}
      <path d="M28 23 L32 24 L36 23" fill="none" stroke="#2a1a0a" strokeWidth="0.8" strokeLinecap="round" />
      {/* Katana */}
      <line x1="48" y1="14" x2="52" y2="56" stroke="#c0c0c0" strokeWidth="2" />
      <line x1="48" y1="14" x2="52" y2="56" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <rect x="47" y="28" width="6" height="3" rx="1" fill="#ccaa00" />
      <rect x="48" y="31" width="4" height="8" rx="1" fill="#4a2a1a" />
      {/* Feet */}
      <ellipse cx="26" cy="54" rx="4" ry="2" fill="#333333" />
      <ellipse cx="38" cy="54" rx="4" ry="2" fill="#333333" />
    </svg>
  );
}

// ── Vegeta (QA) — Shield guardian in purple armor ──
function QASprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - purple armor */}
      <ellipse cx="32" cy="50" rx="14" ry="8" fill="#2a1040" />
      <rect x="20" y="28" width="24" height="24" rx="3" fill="#4a2a6a" />
      {/* Armor pattern */}
      <path d="M24 30 L32 38 L40 30" fill="none" stroke="#6a3a8a" strokeWidth="1.5" />
      <path d="M24 38 L32 46 L40 38" fill="none" stroke="#6a3a8a" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="32" cy="18" r="11" fill="#f5d0a9" />
      {/* Spiked hair */}
      <path d="M22 14 L20 4 L26 12 L28 2 L32 10 L36 2 L38 12 L44 4 L42 14" fill="#1a1030" />
      <path d="M22 14 Q32 10 42 14" fill="#1a1030" />
      {/* Intense eyes */}
      <ellipse cx="27" cy="19" rx="2.5" ry={isActive ? 3 : 2} fill="white" />
      <ellipse cx="37" cy="19" rx="2.5" ry={isActive ? 3 : 2} fill="white" />
      <circle cx="27" cy="19" r="1.5" fill="#4a1a6a" />
      <circle cx="37" cy="19" r="1.5" fill="#4a1a6a" />
      {isActive && <>
        <circle cx="26.5" cy="18.5" r="0.6" fill="white" />
        <circle cx="36.5" cy="18.5" r="0.6" fill="white" />
      </>}
      {/* Scowl */}
      <line x1="24" y1="16" x2="28" y2="17" stroke="#1a0a0a" strokeWidth="1" strokeLinecap="round" />
      <line x1="40" y1="16" x2="36" y2="17" stroke="#1a0a0a" strokeWidth="1" strokeLinecap="round" />
      <path d="M29 24 L35 24" fill="none" stroke="#2a1a0a" strokeWidth="1" strokeLinecap="round" />
      {/* Shield */}
      <path d="M6 30 L6 46 Q6 52 14 52 Q22 52 22 46 L22 30 Z" fill="#6a3a8a" stroke="#8a5aaa" strokeWidth="1" />
      <path d="M10 34 L14 42 L18 34 Z" fill="#ccaa00" />
      <circle cx="14" cy="38" r="2" fill="#ccaa00" />
      {/* Feet */}
      <ellipse cx="26" cy="54" rx="4" ry="2" fill="#2a1040" />
      <ellipse cx="38" cy="54" rx="4" ry="2" fill="#2a1040" />
    </svg>
  );
}

// ── Jet (Comms) — Hawk messenger ──
function CommsSprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - teal outfit */}
      <ellipse cx="32" cy="50" rx="13" ry="7" fill="#1a4a3a" />
      <rect x="21" y="30" width="22" height="22" rx="3" fill="#2a6a4a" />
      {/* Vest */}
      <path d="M25 30 L32 52 L39 30" fill="none" stroke="#1a5a3a" strokeWidth="2" />
      {/* Head */}
      <circle cx="32" cy="22" r="11" fill="#f5d0a9" />
      {/* Messy hair */}
      <path d="M21 18 L23 10 L27 16 L30 9 L34 15 L38 10 L41 17 L43 12 L43 18" fill="#2a4a3a" />
      <path d="M21 18 Q32 14 43 18" fill="#2a4a3a" />
      {/* Friendly eyes */}
      <circle cx="27" cy="22" r="2" fill="#1a3a2a" />
      <circle cx="37" cy="22" r="2" fill="#1a3a2a" />
      {isActive && <>
        <circle cx="26.5" cy="21.5" r="0.7" fill="white" />
        <circle cx="36.5" cy="21.5" r="0.7" fill="white" />
      </>}
      {/* Smile */}
      <path d="M28 26 Q32 30 36 26" fill="none" stroke="#2a1a0a" strokeWidth="1" strokeLinecap="round" />
      {/* Hawk on shoulder */}
      <g transform="translate(44, 18)">
        <ellipse cx="0" cy="0" rx="5" ry="4" fill="#8b6914" />
        <circle cx="-3" cy="-2" r="2.5" fill="#6b5010" />
        <circle cx="-4" cy="-2.5" r="1" fill="#ff8800" />
        <circle cx="-4" cy="-2.5" r="0.5" fill="#1a1a1a" />
        <path d="M-5 -1.5 L-7 -1" fill="none" stroke="#ccaa00" strokeWidth="1" strokeLinecap="round" />
        {/* Wing */}
        <path d={isActive ? "M2 -2 L10 -6 L8 0 Z" : "M2 -2 L6 -1 L4 2 Z"} fill="#6b5010" />
      </g>
      {/* Feet */}
      <ellipse cx="27" cy="54" rx="4" ry="2" fill="#1a3a2a" />
      <ellipse cx="37" cy="54" rx="4" ry="2" fill="#1a3a2a" />
    </svg>
  );
}

// ── Claw (Main/Shogun) — Castle lord in red & gold ──
function ShogunSprite({ size = 64, glow, className, isActive }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}
      style={{ filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined }}>
      {/* Body - ornate red robe */}
      <ellipse cx="32" cy="52" rx="16" ry="8" fill="#660000" />
      <rect x="18" y="28" width="28" height="26" rx="4" fill="#cc2200" />
      {/* Gold trim */}
      <rect x="18" y="28" width="28" height="3" rx="1" fill="#ccaa00" />
      <rect x="29" y="28" width="6" height="26" rx="1" fill="#991100" />
      <line x1="29" y1="28" x2="29" y2="54" stroke="#ccaa00" strokeWidth="0.5" />
      <line x1="35" y1="28" x2="35" y2="54" stroke="#ccaa00" strokeWidth="0.5" />
      {/* Mon (family crest) on chest */}
      <circle cx="32" cy="38" r="4" fill="none" stroke="#ccaa00" strokeWidth="1" />
      <path d="M32 34 L32 42 M28 38 L36 38" stroke="#ccaa00" strokeWidth="0.8" />
      {/* Shoulder pads */}
      <ellipse cx="16" cy="32" rx="6" ry="5" fill="#cc2200" stroke="#ccaa00" strokeWidth="0.5" />
      <ellipse cx="48" cy="32" rx="6" ry="5" fill="#cc2200" stroke="#ccaa00" strokeWidth="0.5" />
      {/* Head */}
      <circle cx="32" cy="18" r="11" fill="#f5d0a9" />
      {/* Elaborate hat (eboshi) */}
      <path d="M20 16 L22 2 L42 2 L44 16" fill="#1a1a1a" />
      <rect x="22" y="2" width="20" height="4" rx="1" fill="#ccaa00" />
      <rect x="18" y="14" width="28" height="3" rx="1" fill="#ccaa00" />
      {/* Wise eyes */}
      <ellipse cx="27" cy="20" rx="2.5" ry={isActive ? 2.5 : 1.5} fill="#2a1a0a" />
      <ellipse cx="37" cy="20" rx="2.5" ry={isActive ? 2.5 : 1.5} fill="#2a1a0a" />
      {isActive && <>
        <circle cx="26" cy="19" r="0.8" fill="white" />
        <circle cx="36" cy="19" r="0.8" fill="white" />
      </>}
      {/* Noble expression */}
      <path d="M28 24 Q32 26 36 24" fill="none" stroke="#2a1a0a" strokeWidth="0.8" strokeLinecap="round" />
      {/* Fan in hand */}
      <g transform="translate(48, 38) rotate(15)">
        <path d="M0 0 L-8 -8 Q0 -12 8 -8 Z" fill="#cc2200" stroke="#ccaa00" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="#6b4a2e" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Feet */}
      <ellipse cx="26" cy="56" rx="5" ry="2" fill="#1a1a1a" />
      <ellipse cx="38" cy="56" rx="5" ry="2" fill="#1a1a1a" />
    </svg>
  );
}

// Get the right sprite for an agent
export function AgentSprite({
  agentId,
  agentName,
  size = 64,
  glow,
  className,
  isActive,
}: SpriteProps & { agentId: string; agentName: string }) {
  const id = agentId.toLowerCase();
  const name = agentName.toLowerCase();

  if (id.includes("planner") || name.includes("erwin") || name.includes("atlas"))
    return <PlannerSprite size={size} glow={glow} className={className} isActive={isActive} />;
  if (id.includes("researcher") || name.includes("senku") || name.includes("scout"))
    return <ResearcherSprite size={size} glow={glow} className={className} isActive={isActive} />;
  if (id.includes("qa") || name.includes("vegeta") || name.includes("lens"))
    return <QASprite size={size} glow={glow} className={className} isActive={isActive} />;
  if (id.includes("comms") || name.includes("jet") || name.includes("herald"))
    return <CommsSprite size={size} glow={glow} className={className} isActive={isActive} />;
  if (id === "main" || name.includes("claw"))
    return <ShogunSprite size={size} glow={glow} className={className} isActive={isActive} />;

  return <CoderSprite size={size} glow={glow} className={className} isActive={isActive} />;
}
