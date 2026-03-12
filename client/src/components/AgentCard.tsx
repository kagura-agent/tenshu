import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { config, state, color, emoji } = agent;
  const statusColor = STATUS_COLORS[state.status] || STATUS_COLORS.offline;

  return (
    <Card
      className="bg-zinc-900 border-zinc-800"
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
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
