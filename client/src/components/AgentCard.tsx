import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentSprite } from "@/office2d/sprites";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { config, state, color } = agent;
  const statusColor = STATUS_COLORS[state.status] || STATUS_COLORS.offline;
  const isActive = state.status === "working" || state.status === "thinking";

  return (
    <Card
      className="bg-zinc-900 border-zinc-800"
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <CardContent className="p-4">
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
            </div>
            {state.currentTask && (
              <p className="text-sm text-zinc-400 truncate mt-1">
                {state.currentTask}
              </p>
            )}
            {state.model && (
              <p className="text-xs text-zinc-500 mt-1">{state.model}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
