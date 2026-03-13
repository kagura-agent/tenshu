import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";

interface WarRoomProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId: string | null;
}

const STATUS_KANJI: Record<string, string> = {
  working: "稼働",
  thinking: "思考",
  idle: "待機",
  error: "異常",
  offline: "不在",
};

function guessRole(agent: Agent): string {
  const id = agent.config.id.toLowerCase();
  const name = agent.config.name.toLowerCase();
  for (const role of ["planner", "researcher", "coder", "qa", "comms"]) {
    if (id.includes(role) || name.includes(role)) return role;
  }
  if (name.includes("erwin") || name.includes("atlas")) return "planner";
  if (name.includes("senku") || name.includes("scout")) return "researcher";
  if (name.includes("bulma") || name.includes("forge")) return "coder";
  if (name.includes("vegeta") || name.includes("lens")) return "qa";
  if (name.includes("jet") || name.includes("herald")) return "comms";
  return "coder";
}

export function WarRoom({ agents, onSelectAgent, selectedAgentId }: WarRoomProps) {
  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col" style={{ background: "#1a1410" }}>
      {/* Tatami floor */}
      <div className="absolute inset-0" style={{
        background: `
          repeating-linear-gradient(0deg, transparent, transparent 79px, #3a2e1e 79px, #3a2e1e 81px),
          repeating-linear-gradient(90deg, transparent, transparent 119px, #3a2e1e 119px, #3a2e1e 121px),
          linear-gradient(135deg, #2a2215 0%, #1e1a10 100%)
        `,
      }} />

      {/* Shoji screen top border */}
      <div className="relative z-10 flex h-14 items-end px-6 gap-2 shrink-0" style={{
        background: "linear-gradient(to bottom, #1a1410 0%, transparent 100%)",
      }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex-1 h-10 rounded-t-sm" style={{
            background: "linear-gradient(to bottom, rgba(245, 230, 208, 0.15) 0%, rgba(245, 230, 208, 0.03) 100%)",
            border: "1px solid rgba(180, 140, 80, 0.12)",
            borderBottom: "none",
          }} />
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center gap-8 px-8">
        {/* Hanging scroll (kakejiku) */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-1.5 rounded bg-amber-700/50" />
          <div className="w-24 border border-amber-700/30 px-4 py-3 flex flex-col items-center" style={{
            background: "linear-gradient(180deg, #3d3020 0%, #2a2215 100%)",
          }}>
            <span className="text-3xl font-bold text-amber-300/70" style={{ writingMode: "vertical-rl" }}>
              作戦室
            </span>
          </div>
          <div className="w-20 h-1 rounded bg-amber-700/30" />
        </div>

        {/* Central war table with agents around it */}
        <div className="relative">
          {/* The table */}
          <div className="w-[500px] h-[220px] rounded-xl border-2 border-amber-800/40 relative" style={{
            background: "linear-gradient(135deg, #3a2e1e 0%, #2a2015 50%, #3a2e1e 100%)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.05)",
          }}>
            {/* Map texture on table */}
            <div className="absolute inset-4 rounded border border-amber-700/20 overflow-hidden" style={{
              background: "linear-gradient(135deg, rgba(245, 230, 208, 0.08) 0%, rgba(232, 213, 184, 0.04) 100%)",
            }}>
              {/* Grid lines on map */}
              <div className="absolute inset-0" style={{
                background: `
                  repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(180,140,80,0.06) 29px, rgba(180,140,80,0.06) 30px),
                  repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(180,140,80,0.06) 29px, rgba(180,140,80,0.06) 30px)
                `,
              }} />
            </div>
            {/* Tenshu stamp */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold" style={{ color: "rgba(180, 40, 40, 0.15)" }}>天守</span>
            </div>
          </div>

          {/* Agents positioned around the table */}
          {agents.map((agent, i) => {
            const total = agents.length;
            const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
            const rx = 320;
            const ry = 200;
            const x = Math.cos(angle) * rx;
            const y = Math.sin(angle) * ry;
            const status = agent.state?.status ?? "offline";
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
            const role = guessRole(agent);
            const isSelected = selectedAgentId === agent.config.id;
            const isActive = status === "working" || status === "thinking";

            return (
              <button
                key={agent.config.id}
                onClick={() => onSelectAgent(agent)}
                className="absolute group focus:outline-none"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className={`flex flex-col items-center transition-all duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                  {/* Zabuton (cushion) + avatar */}
                  <div className="relative w-28 rounded-xl p-3 text-center" style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${agent.color}22 0%, ${agent.color}0a 100%)`
                      : "linear-gradient(135deg, #2e261c 0%, #221e16 100%)",
                    border: isSelected
                      ? `2px solid ${agent.color}55`
                      : "1px solid rgba(180, 140, 80, 0.2)",
                    boxShadow: isSelected
                      ? `0 0 24px ${agent.color}18, 0 4px 16px rgba(0,0,0,0.4)`
                      : "0 4px 16px rgba(0,0,0,0.4)",
                  }}>
                    {/* Avatar */}
                    <div className="text-3xl mb-1" style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${statusColor}66)` : "none",
                    }}>
                      {agent.emoji || "🤖"}
                    </div>

                    {/* Name */}
                    <div className="text-xs font-bold text-amber-200/90 truncate">
                      {agent.config.name}
                    </div>

                    {/* Role */}
                    <div className="text-[10px] text-amber-200/40">{role}</div>

                    {/* Status dot */}
                    <div className="absolute -top-1 -right-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-[#1a1410] ${isActive ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: statusColor }}
                      />
                    </div>
                  </div>

                  {/* Status kanji badge */}
                  <div className="mt-2 px-3 py-1 rounded-md text-[10px] font-bold border" style={{
                    color: statusColor,
                    borderColor: `${statusColor}44`,
                    backgroundColor: `${statusColor}15`,
                  }}>
                    {STATUS_KANJI[status] || status}
                  </div>

                  {/* Task tooltip on hover */}
                  {agent.state?.currentTask && (
                    <div className="mt-1 max-w-[160px] text-[9px] text-zinc-500 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {agent.state.currentTask}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoji screen bottom border */}
      <div className="relative z-10 flex h-14 items-start px-6 gap-2 shrink-0" style={{
        background: "linear-gradient(to top, #1a1410 0%, transparent 100%)",
      }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex-1 h-10 rounded-b-sm" style={{
            background: "linear-gradient(to top, rgba(245, 230, 208, 0.15) 0%, rgba(245, 230, 208, 0.03) 100%)",
            border: "1px solid rgba(180, 140, 80, 0.12)",
            borderTop: "none",
          }} />
        ))}
      </div>

      {/* Corner lanterns */}
      {["top-20 left-10", "top-20 right-10", "bottom-20 left-10", "bottom-20 right-10"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} z-10 flex flex-col items-center`}>
          <div className="w-4 h-6 rounded-full border border-amber-600/40" style={{
            background: "radial-gradient(ellipse, rgba(255, 180, 60, 0.6) 0%, rgba(255, 140, 40, 0.2) 60%, transparent 100%)",
            boxShadow: "0 0 20px rgba(255, 160, 50, 0.2)",
          }} />
          <div className="w-px h-3 bg-amber-800/30" />
        </div>
      ))}
    </div>
  );
}
