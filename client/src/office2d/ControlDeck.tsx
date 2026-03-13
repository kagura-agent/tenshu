import { useEffect, useState } from "react";
import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";

interface ControlDeckProps {
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

function SakuraPetals() {
  const [petals] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 6 + Math.random() * 8,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute sakura-petal"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size * 0.7}px`,
            background: "radial-gradient(ellipse, #ffb7c5 20%, #ff91a4 100%)",
            borderRadius: "50% 0 50% 50%",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        .sakura-petal {
          opacity: 0;
          animation-name: sakuraFall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes sakuraFall {
          0% { opacity: 0; transform: translateY(-20px) translateX(0) rotate(0deg); }
          5% { opacity: 0.8; }
          95% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(100vh) translateX(60px) rotate(540deg); }
        }
      `}</style>
    </div>
  );
}

function TerminalFeed() {
  const [lines, setLines] = useState<string[]>([
    ">> tenshu v0.1.0 初期化完了",
    ">> agent_gateway: connected",
    ">> monitoring: active",
  ]);

  useEffect(() => {
    const msgs = [
      ">> cycle_check: nominal",
      ">> ratchet: threshold=5.0",
      ">> agents: online",
      ">> ollama: model loaded",
      ">> heartbeat: ok",
      ">> ralph_loop: standby",
    ];
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, msgs[Math.floor(Math.random() * msgs.length)]];
        return next.slice(-6);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-5 left-5 z-10 w-60 font-mono text-[10px] leading-relaxed bg-black/40 rounded-lg border border-emerald-500/10 p-3">
      {lines.map((line, i) => (
        <div key={`${i}-${line}`} className={i === lines.length - 1 ? "text-emerald-400" : "text-emerald-400/40"}>
          {line}
        </div>
      ))}
      <div className="text-emerald-400 animate-pulse">_</div>
    </div>
  );
}

export function ControlDeck({ agents, onSelectAgent, selectedAgentId }: ControlDeckProps) {
  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col" style={{
      background: "linear-gradient(180deg, #08081a 0%, #0d0d22 40%, #14102a 100%)",
    }}>
      <SakuraPetals />

      {/* CRT scan lines */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.04]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
      }} />

      {/* Neon ceiling line */}
      <div className="relative z-10 h-16 shrink-0 flex items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-12" style={{
          background: "linear-gradient(to top, rgba(6, 182, 212, 0.05) 0%, transparent 100%)",
        }} />
        <div className="flex items-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400/40" />
          <span className="text-cyan-400/80 text-sm tracking-[0.4em] font-light">
            天守 COMMAND CENTER
          </span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400/40" />
        </div>
      </div>

      {/* Agent workstations — centered grid */}
      <div className="flex-1 flex items-center justify-center z-10 px-4">
        <div className="flex items-end gap-4 flex-wrap justify-center">
          {agents.map((agent) => {
            const status = agent.state?.status ?? "offline";
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
            const isSelected = selectedAgentId === agent.config.id;
            const isActive = status === "working" || status === "thinking";

            return (
              <button
                key={agent.config.id}
                onClick={() => onSelectAgent(agent)}
                className="group focus:outline-none flex flex-col items-center"
              >
                <div className={`relative transition-all duration-300 ${isSelected ? "scale-105 -translate-y-3" : "group-hover:-translate-y-1"}`}>
                  {/* Glow behind monitor */}
                  {isActive && (
                    <div className="absolute -inset-6 rounded-2xl" style={{
                      background: `radial-gradient(ellipse, ${agent.color}18 0%, transparent 70%)`,
                    }} />
                  )}

                  {/* Monitor */}
                  <div className="w-32 h-24 rounded-lg border-2 relative overflow-hidden" style={{
                    borderColor: isSelected ? `${agent.color}88` : "rgba(100, 100, 160, 0.25)",
                    background: "linear-gradient(135deg, #0c0c1e 0%, #16162e 100%)",
                    boxShadow: isSelected
                      ? `0 0 30px ${agent.color}25, 0 8px 24px rgba(0,0,0,0.5)`
                      : "0 8px 24px rgba(0,0,0,0.5)",
                  }}>
                    {/* Screen content */}
                    <div className="absolute inset-[3px] rounded overflow-hidden">
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-2 py-1.5" style={{
                        background: `linear-gradient(90deg, ${statusColor}15 0%, transparent 100%)`,
                        borderBottom: `1px solid ${statusColor}22`,
                      }}>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${isActive ? "animate-pulse" : ""}`}
                            style={{ backgroundColor: statusColor }}
                          />
                          <span className="text-[9px] font-mono font-bold" style={{ color: statusColor }}>
                            {STATUS_KANJI[status]}
                          </span>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-mono">
                          {agent.state?.model?.split(":")[0] || "—"}
                        </span>
                      </div>

                      {/* Terminal lines */}
                      <div className="p-2 space-y-1">
                        {isActive ? (
                          <>
                            <div className="h-1.5 w-4/5 rounded-full" style={{ background: `${agent.color}35` }} />
                            <div className="h-1.5 w-3/5 rounded-full" style={{ background: `${agent.color}25` }} />
                            <div className="h-1.5 w-full rounded-full" style={{ background: `${agent.color}18` }} />
                            <div className="h-1.5 w-2/3 rounded-full animate-pulse" style={{ background: `${agent.color}30` }} />
                            <div className="h-1.5 w-1/2 rounded-full" style={{ background: `${agent.color}15` }} />
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-3/4 rounded-full bg-zinc-700/30" />
                            <div className="h-1.5 w-1/2 rounded-full bg-zinc-700/20" />
                            <div className="h-1.5 w-5/6 rounded-full bg-zinc-700/15" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Monitor stand */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-5 bg-zinc-700 border-x border-zinc-600/30" />
                    <div className="w-12 h-1.5 rounded-full bg-zinc-700 border border-zinc-600/20" />
                  </div>

                  {/* Agent emoji — sitting at desk */}
                  <div className="absolute -bottom-1 -left-4 text-3xl" style={{
                    filter: isActive ? `drop-shadow(0 0 8px ${agent.color}55)` : "none",
                  }}>
                    {agent.emoji || "🤖"}
                  </div>
                </div>

                {/* Name + status below */}
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-sm font-bold tracking-wide" style={{
                    color: isSelected ? agent.color : "rgba(210, 210, 230, 0.8)",
                    textShadow: isSelected ? `0 0 12px ${agent.color}44` : "none",
                  }}>
                    {agent.config.name}
                  </span>
                  {agent.state?.currentTask && (
                    <span className="mt-1 text-[10px] text-zinc-500 max-w-[140px] truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {agent.state.currentTask}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor with neon reflection */}
      <div className="relative z-0 h-28 shrink-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(88, 28, 135, 0.06) 0%, rgba(0,0,0,0.4) 100%)",
        }} />
      </div>

      {/* Torii gate silhouette — right */}
      <svg className="absolute bottom-32 right-8 z-0 text-red-400 opacity-[0.07]" width="90" height="110" viewBox="0 0 80 100">
        <rect x="8" y="20" width="6" height="80" fill="currentColor" />
        <rect x="66" y="20" width="6" height="80" fill="currentColor" />
        <rect x="0" y="10" width="80" height="6" rx="2" fill="currentColor" />
        <rect x="4" y="20" width="72" height="4" fill="currentColor" />
      </svg>

      {/* Wave pattern — left */}
      <svg className="absolute bottom-32 left-8 z-0 text-cyan-400 opacity-[0.06]" width="100" height="60" viewBox="0 0 80 60">
        <path d="M0 20 Q10 5 20 20 Q30 35 40 20 Q50 5 60 20 Q70 35 80 20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M0 35 Q10 20 20 35 Q30 50 40 35 Q50 20 60 35 Q70 50 80 35" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M0 50 Q10 35 20 50 Q30 65 40 50 Q50 35 60 50 Q70 65 80 50" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      <TerminalFeed />

      {/* Status summary — top right */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-3">
        {agents.map((a) => {
          const s = a.state?.status ?? "offline";
          const c = STATUS_COLORS[s] ?? STATUS_COLORS.offline;
          return (
            <div key={a.config.id} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${s === "working" || s === "thinking" ? "animate-pulse" : ""}`} style={{ backgroundColor: c }} />
              <span className="text-[10px] text-zinc-400">{a.config.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
