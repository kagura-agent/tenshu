import { X } from "lucide-react";
import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";

interface AgentPanelProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  const status = agent.state?.status ?? "offline";
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-black/90 backdrop-blur-md text-white p-6 shadow-2xl border-l border-white/10 z-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-4xl">{agent.emoji}</span>
            {agent.config.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{agent.config.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Status badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
        style={{ backgroundColor: `${statusColor}33` }}
      >
        <div
          className={`w-2 h-2 rounded-full ${status === "thinking" ? "animate-pulse" : ""}`}
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-sm font-medium" style={{ color: statusColor }}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Current task */}
      {agent.state?.currentTask && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Current Task</h3>
          <p className="text-base">{agent.state.currentTask}</p>
        </div>
      )}

      {/* Model */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Model</h3>
        <p className="text-lg font-bold capitalize">{agent.state?.model ?? "N/A"}</p>
      </div>

      {/* Agent color indicator */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Agent Color</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: agent.color }} />
          <span className="text-sm text-gray-300">{agent.color}</span>
        </div>
      </div>
    </div>
  );
}
