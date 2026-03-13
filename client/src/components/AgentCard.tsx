import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import { ThemedCard } from "@/components/ThemedCard";
import { Badge } from "@/components/ui/badge";
import { AgentSprite } from "@/office2d/sprites";
import { useTheme } from "@/hooks/useTheme";
import type { PowerLevel } from "@/hooks/usePowerLevel";

const LEVEL_COLORS: Record<string, string> = {
  Genin: "#71717a",
  Chunin: "#22c55e",
  Jonin: "#3b82f6",
  Kage: "#a855f7",
  Hokage: "#f59e0b",
};

interface AgentCardProps {
  agent: Agent;
  power?: PowerLevel;
}

export function AgentCard({ agent, power }: AgentCardProps) {
  const { config, state, color } = agent;
  const { theme } = useTheme();
  const accent = theme === "warroom" ? "#f59e0b" : theme === "deck" ? "#06b6d4" : "#f472b6";
  const statusColor = STATUS_COLORS[state.status] || STATUS_COLORS.offline;
  const isActive = state.status === "working" || state.status === "thinking";

  return (
    <ThemedCard
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <div className="flex items-center gap-3">
        <AgentSprite
          agentId={config.id}
          agentName={config.name}
          size={40}
          glow={isActive ? statusColor : undefined}
          isActive={isActive}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-100">{config.name}</span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ color: statusColor, borderColor: statusColor }}
            >
              {state.status}
            </Badge>
            {power && power.xp > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-mono"
                style={{
                  color: LEVEL_COLORS[power.levelName] || accent,
                  borderColor: `${LEVEL_COLORS[power.levelName] || accent}66`,
                }}
              >
                {power.levelName}
              </Badge>
            )}
          </div>
          {state.currentTask && (
            <p className="text-sm text-zinc-400 truncate mt-1">
              {state.currentTask}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {state.model && (
              <p className="text-xs text-zinc-500">{state.model}</p>
            )}
            {power && power.xp > 0 && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-zinc-500 font-mono">
                  PL:{power.powerLevel}
                </span>
                <div className="flex-1 max-w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${power.progress * 100}%`,
                      backgroundColor: LEVEL_COLORS[power.levelName] || accent,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {power.xp}/{power.nextLevelXp}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemedCard>
  );
}
