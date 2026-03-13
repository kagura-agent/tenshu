import { useMemo } from "react";
import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import { AgentSprite } from "./sprites";
import { AnimatedCanvas } from "./AnimatedCanvas";
import { useAgentHistory, useCurrentCycle } from "@/hooks/useAgentHistory";
import type { CycleEntry } from "@/hooks/useAgentHistory";

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

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 8 ? "#22c55e" : score >= 6 ? "#eab308" : score >= 4 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-1">
      <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function MiniHistory({ entries }: { entries: CycleEntry[] }) {
  if (!entries.length) return null;
  return (
    <div className="mt-2 space-y-1">
      {entries.slice(0, 3).map((e) => (
        <div key={e.cycle} className="flex items-center gap-2 text-[9px]">
          <span className="text-zinc-600 w-8 shrink-0">#{e.cycle}</span>
          <span className="text-amber-200/60 truncate flex-1" title={e.detailedTask || e.description}>
            {e.description || e.task}
          </span>
          <ScoreBar score={e.score} />
          <span
            className={`w-3 text-center ${e.status === "keep" ? "text-emerald-400" : "text-red-400"}`}
          >
            {e.status === "keep" ? "✓" : "✗"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WarRoom({ agents, onSelectAgent, selectedAgentId }: WarRoomProps) {
  const { data: history } = useAgentHistory(8);
  const { data: current } = useCurrentCycle();

  const intensity = useMemo(() => {
    const activeCount = agents.filter(
      (a) => a.state?.status === "working" || a.state?.status === "thinking"
    ).length;
    return Math.min(1, activeCount / Math.max(agents.length, 1));
  }, [agents]);

  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col" style={{ background: "#1a1410" }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: "url(/assets/backgrounds/warroom_0.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.35,
      }} />
      {/* Animated particles on top of background */}
      <AnimatedCanvas theme="warroom" intensity={intensity} />

      {/* Shoji screen top */}
      <div className="relative z-10 flex h-12 items-end px-6 gap-2 shrink-0" style={{
        background: "linear-gradient(to bottom, #1a1410 0%, transparent 100%)",
      }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex-1 h-8 rounded-t-sm" style={{
            background: "linear-gradient(to bottom, rgba(245, 230, 208, 0.15) 0%, rgba(245, 230, 208, 0.03) 100%)",
            border: "1px solid rgba(180, 140, 80, 0.12)",
            borderBottom: "none",
          }} />
        ))}
      </div>

      {/* Current cycle banner */}
      {current?.running && (
        <div className="relative z-20 mx-auto mt-2 flex items-center gap-3 px-4 py-2 rounded-lg border border-amber-700/30" style={{
          background: "linear-gradient(90deg, rgba(42, 34, 21, 0.9) 0%, rgba(30, 26, 16, 0.9) 100%)",
        }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-300/80 font-mono">
            Cycle #{current.cycle} — {current.task}
          </span>
          {current.lastStatus && (
            <span className="text-[10px] text-amber-200/40">
              {current.lastStatus}
            </span>
          )}
        </div>
      )}

      {/* Main area — agent cards in a grid */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {agents.map((agent) => {
            const status = agent.state?.status ?? "offline";
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
            const role = guessRole(agent);
            const isSelected = selectedAgentId === agent.config.id;
            const isActive = status === "working" || status === "thinking";
            const agentHistory = history?.[role] || [];

            return (
              <button
                key={agent.config.id}
                onClick={() => onSelectAgent(agent)}
                className={`group focus:outline-none text-left rounded-xl p-4 transition-all duration-200 ${
                  isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}08 100%)`
                    : "linear-gradient(135deg, #2e261c 0%, #221e16 100%)",
                  border: isSelected
                    ? `2px solid ${agent.color}55`
                    : "1px solid rgba(180, 140, 80, 0.15)",
                  boxShadow: isSelected
                    ? `0 0 24px ${agent.color}15`
                    : "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {/* Header: sprite + name + status */}
                <div className="flex items-start gap-3">
                  <AgentSprite
                    agentId={agent.config.id}
                    agentName={agent.config.name}
                    size={64}
                    glow={isActive ? statusColor : undefined}
                    isActive={isActive}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-200/90">
                        {agent.config.name}
                      </span>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${isActive ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: statusColor }}
                      />
                    </div>
                    <div className="text-[10px] text-amber-200/40">{role}</div>
                    <div className="mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold inline-block border" style={{
                      color: statusColor,
                      borderColor: `${statusColor}33`,
                      backgroundColor: `${statusColor}0d`,
                    }}>
                      {STATUS_KANJI[status] || status}
                    </div>
                  </div>
                </div>

                {/* Current task */}
                {agent.state?.currentTask && (
                  <div className="mt-2 text-[10px] text-zinc-400 truncate">
                    {agent.state.currentTask}
                  </div>
                )}

                {/* Recent history */}
                <MiniHistory entries={agentHistory} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoji screen bottom */}
      <div className="relative z-10 flex h-12 items-start px-6 gap-2 shrink-0" style={{
        background: "linear-gradient(to top, #1a1410 0%, transparent 100%)",
      }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex-1 h-8 rounded-b-sm" style={{
            background: "linear-gradient(to top, rgba(245, 230, 208, 0.15) 0%, rgba(245, 230, 208, 0.03) 100%)",
            border: "1px solid rgba(180, 140, 80, 0.12)",
            borderTop: "none",
          }} />
        ))}
      </div>

      {/* Corner lanterns */}
      {["top-16 left-10", "top-16 right-10", "bottom-16 left-10", "bottom-16 right-10"].map((pos, i) => (
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
