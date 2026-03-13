/**
 * Agent character portraits using AI-generated anime art.
 * Images generated with Flux Schnell via ComfyUI.
 */

interface SpriteProps {
  size?: number;
  glow?: string;
  className?: string;
  isActive?: boolean;
}

interface AgentSpriteProps extends SpriteProps {
  agentId: string;
  agentName: string;
}

// Map agent roles to character image files
const ROLE_IMAGES: Record<string, string> = {
  planner: "/assets/characters/strategist_0.png",
  researcher: "/assets/characters/scientist_0.png",
  coder: "/assets/characters/engineer_0.png",
  qa: "/assets/characters/guardian_0.png",
  comms: "/assets/characters/messenger_0.png",
  leader: "/assets/characters/commander_0.png",
};

// Fallback for unknown roles
const DEFAULT_IMAGE = "/assets/characters/ronin_0.png";

function guessRoleForSprite(agentId: string, agentName: string): string {
  const id = agentId.toLowerCase();
  const name = agentName.toLowerCase();
  for (const role of ["planner", "researcher", "coder", "qa", "comms"]) {
    if (id.includes(role) || name.includes(role)) return role;
  }
  if (name.includes("erwin") || name.includes("atlas")) return "planner";
  if (name.includes("senku") || name.includes("scout")) return "researcher";
  if (name.includes("bulma") || name.includes("forge")) return "coder";
  if (name.includes("vegeta") || name.includes("lens")) return "qa";
  if (name.includes("jet") || name.includes("herald")) return "comms";
  if (name.includes("claw") || name.includes("shogun")) return "leader";
  return "coder";
}

export function AgentSprite({ agentId, agentName, size = 64, glow, className, isActive }: AgentSpriteProps) {
  const role = guessRoleForSprite(agentId, agentName);
  const src = ROLE_IMAGES[role] || DEFAULT_IMAGE;

  return (
    <div
      className={`relative shrink-0 ${className || ""}`}
      style={{
        width: size,
        height: size,
        filter: glow ? `drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 20px ${glow}40)` : undefined,
      }}
    >
      <img
        src={src}
        alt={agentName}
        width={size}
        height={size}
        className={`rounded-lg object-cover ${isActive ? "animate-subtle-bounce" : ""}`}
        style={{
          imageRendering: "auto",
        }}
      />
      {/* Active indicator overlay */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-lg animate-pulse pointer-events-none"
          style={{
            background: glow
              ? `radial-gradient(ellipse, ${glow}20 0%, transparent 70%)`
              : undefined,
          }}
        />
      )}
    </div>
  );
}
