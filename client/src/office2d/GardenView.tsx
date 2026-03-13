import { useMemo } from "react";
import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import { AgentSprite } from "./sprites";
import { AnimatedCanvas } from "./AnimatedCanvas";
import { Sparkline } from "@/components/Sparkline";
import { useAgentHistory, useCurrentCycle } from "@/hooks/useAgentHistory";
import type { CycleEntry } from "@/hooks/useAgentHistory";

interface GardenViewProps {
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
    score >= 8 ? "#86efac" : score >= 6 ? "#fde68a" : score >= 4 ? "#fdba74" : "#fca5a5";
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  );
}

function MiniHistory({ entries }: { entries: CycleEntry[] }) {
  if (!entries.length) return null;
  const scores = entries.map((e) => e.score);
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Sparkline values={scores} width={48} height={12} />
        <span className="text-[7px] text-pink-300/40">{entries.length} cycles</span>
      </div>
      {entries.slice(0, 2).map((e) => (
        <div key={e.cycle} className="flex items-center gap-1.5 text-[8px]">
          <span className="text-pink-300/30 shrink-0">#{e.cycle}</span>
          <span className="text-pink-200/50 truncate flex-1" title={e.detailedTask || e.description}>
            {e.description || e.task}
          </span>
          <ScoreBar score={e.score} />
        </div>
      ))}
    </div>
  );
}

export function GardenView({ agents, onSelectAgent, selectedAgentId }: GardenViewProps) {
  const { data: history } = useAgentHistory(8);
  const { data: current } = useCurrentCycle();

  const intensity = useMemo(() => {
    const activeCount = agents.filter(
      (a) => a.state?.status === "working" || a.state?.status === "thinking"
    ).length;
    return Math.min(1, activeCount / Math.max(agents.length, 1));
  }, [agents]);

  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col" style={{ background: "#1a1018" }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: "url(/assets/backgrounds/zen_garden_0.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.5,
      }} />
      <AnimatedCanvas theme="garden" intensity={intensity} />

      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none z-5" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(26, 16, 24, 0.6) 100%)",
      }} />

      {/* Header */}
      <div className="relative z-10 h-14 shrink-0 flex items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-pink-300/30" />
          <span className="text-pink-200/70 text-sm tracking-[0.4em] font-light">
            枯山水 ZEN GARDEN
          </span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-pink-300/30" />
        </div>
      </div>

      {/* Current cycle banner */}
      {current?.running && (
        <div className="relative z-20 mx-auto mt-1 flex items-center gap-3 px-4 py-1.5 rounded-lg border border-pink-300/20" style={{
          background: "rgba(244, 114, 182, 0.05)",
        }}>
          <div className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" />
          <span className="text-xs text-pink-200/80 font-mono">
            Cycle #{current.cycle} — {current.task}
          </span>
          {current.lastStatus && (
            <span className="text-[10px] text-pink-200/40">{current.lastStatus}</span>
          )}
        </div>
      )}

      {/* Agent stones — laid out like zen garden stones */}
      <div className="flex-1 flex items-center justify-center z-10 px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
          {agents.map((agent) => {
            const status = agent.state?.status ?? "offline";
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
            const role = guessRole(agent);
            const isSelected = selectedAgentId === agent.config.id;
            const isActive = status === "working" || status === "thinking";
            const isError = status === "error";
            const agentHistory = history?.[role] || [];

            return (
              <button
                key={agent.config.id}
                onClick={() => onSelectAgent(agent)}
                className={`group focus:outline-none text-left rounded-2xl p-4 transition-all duration-300 ${
                  isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
                } ${isError ? "animate-error-shake" : ""}`}
                style={{
                  background: isError
                    ? "linear-gradient(135deg, rgba(60, 20, 30, 0.85) 0%, rgba(40, 15, 25, 0.85) 100%)"
                    : isSelected
                      ? `linear-gradient(135deg, rgba(80, 40, 60, 0.7) 0%, rgba(50, 25, 40, 0.7) 100%)`
                      : "linear-gradient(135deg, rgba(60, 35, 50, 0.6) 0%, rgba(40, 22, 35, 0.6) 100%)",
                  border: isError
                    ? "2px solid rgba(239, 68, 68, 0.5)"
                    : isSelected
                      ? "2px solid rgba(244, 114, 182, 0.4)"
                      : "1px solid rgba(244, 114, 182, 0.12)",
                  boxShadow: isError
                    ? "0 0 24px rgba(239, 68, 68, 0.2)"
                    : isSelected
                      ? "0 0 24px rgba(244, 114, 182, 0.15)"
                      : "0 4px 16px rgba(0,0,0,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <AgentSprite
                    agentId={agent.config.id}
                    agentName={agent.config.name}
                    size={56}
                    glow={isActive ? statusColor : undefined}
                    isActive={isActive}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pink-100/90">
                        {agent.config.name}
                      </span>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${isActive ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: statusColor }}
                      />
                    </div>
                    <div className="text-[10px] text-pink-300/40">{role}</div>
                    <div className="mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold inline-block border" style={{
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
                  <div className="mt-2 text-[10px] text-pink-200/50 truncate">
                    {agent.state.currentTask}
                  </div>
                )}

                {/* Error message */}
                {isError && agent.state?.error && (
                  <div className="mt-1.5 px-2 py-1 rounded text-[9px] text-red-300 bg-red-900/20 border border-red-500/20 truncate">
                    {agent.state.error}
                  </div>
                )}

                {/* History */}
                <MiniHistory entries={agentHistory} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer terminal */}
      {current?.recentLines && current.recentLines.length > 0 && (
        <div className="relative z-10 px-6 pb-3">
          <div className="w-[28rem] font-mono text-[10px] leading-relaxed rounded-lg border border-pink-300/10 p-3 overflow-hidden" style={{
            background: "rgba(26, 16, 24, 0.6)",
            backdropFilter: "blur(4px)",
          }}>
            {current.recentLines.slice(-4).map((line, i, arr) => {
              const isNewest = i === arr.length - 1;
              const color = /error/i.test(line)
                ? "text-red-400"
                : /responded/i.test(line)
                  ? "text-pink-300"
                  : isNewest
                    ? "text-pink-200/80"
                    : "text-pink-200/30";
              return (
                <div key={`${i}-${line}`} className={`${color} truncate`}>
                  {line}
                </div>
              );
            })}
            <div className="text-pink-300/60 animate-pulse">_</div>
          </div>
        </div>
      )}

      {/* Zen sand pattern SVG decoration */}
      <svg className="absolute bottom-3 right-6 opacity-[0.06] z-5" width="120" height="60" viewBox="0 0 120 60">
        <path d="M0 15 Q15 5 30 15 Q45 25 60 15 Q75 5 90 15 Q105 25 120 15" fill="none" stroke="#f472b6" strokeWidth="1.5" />
        <path d="M0 30 Q15 20 30 30 Q45 40 60 30 Q75 20 90 30 Q105 40 120 30" fill="none" stroke="#f472b6" strokeWidth="1.5" />
        <path d="M0 45 Q15 35 30 45 Q45 55 60 45 Q75 35 90 45 Q105 55 120 45" fill="none" stroke="#f472b6" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
