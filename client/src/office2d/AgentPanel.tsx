import { useState } from 'react'
import { X, Pencil } from 'lucide-react'
import type { Agent } from '@tenshu/shared'
import { STATUS_COLORS } from '@tenshu/shared'
import { AgentSprite } from './sprites'
import { useAgentHistory } from '@/hooks/useAgentHistory'
import { useAvatarConfig } from '@/hooks/useAvatarConfig'
import { AvatarPicker } from '@/components/AvatarPicker'

interface AgentPanelProps {
  agent: Agent
  onClose: () => void
}

// Map agent roles to character image files (same as sprites.tsx)
const ROLE_IMAGES: Record<string, string> = {
  planner: '/assets/characters/strategist_0.png',
  researcher: '/assets/characters/scientist_0.png',
  coder: '/assets/characters/engineer_0.png',
  qa: '/assets/characters/guardian_0.png',
  comms: '/assets/characters/messenger_0.png',
  leader: '/assets/characters/commander_0.png',
}

function guessRole(agent: Agent): string {
  const id = agent.config.id.toLowerCase()
  const name = agent.config.name.toLowerCase()
  for (const role of ['planner', 'researcher', 'coder', 'qa', 'comms']) {
    if (id.includes(role) || name.includes(role)) return role
  }
  if (name.includes('erwin') || name.includes('atlas')) return 'planner'
  if (name.includes('senku') || name.includes('scout')) return 'researcher'
  if (name.includes('bulma') || name.includes('forge')) return 'coder'
  if (name.includes('vegeta') || name.includes('lens')) return 'qa'
  if (name.includes('jet') || name.includes('herald')) return 'comms'
  return 'coder'
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  const [showPicker, setShowPicker] = useState(false)
  const { data: avatarConfig } = useAvatarConfig()
  const status = agent.state?.status ?? 'offline'
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline
  const isActive = status === 'working' || status === 'thinking'
  const role = guessRole(agent)
  const { data: history } = useAgentHistory(8)
  const agentHistory = history?.[role] || []

  const currentImage =
    avatarConfig?.[agent.config.id] ||
    ROLE_IMAGES[role] ||
    '/assets/characters/ronin_0.png'

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-black/90 backdrop-blur-md text-white p-6 shadow-2xl border-l border-white/10 z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <AgentSprite
              agentId={agent.config.id}
              agentName={agent.config.name}
              size={80}
              glow={isActive ? statusColor : undefined}
              isActive={isActive}
            />
            <button
              onClick={() => setShowPicker(true)}
              className="absolute -bottom-1 -right-1 p-1.5 bg-zinc-800 hover:bg-zinc-600 rounded-full border border-zinc-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Change avatar"
            >
              <Pencil size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{agent.config.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{role}</p>
            <p className="text-xs text-gray-500">{agent.config.id}</p>
          </div>
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
          className={`w-2 h-2 rounded-full ${status === 'thinking' ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-sm font-medium" style={{ color: statusColor }}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Current task */}
      {agent.state?.currentTask && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Current Task
          </h3>
          <p className="text-base">{agent.state.currentTask}</p>
        </div>
      )}

      {/* Model */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Model</h3>
        <p className="text-lg font-bold capitalize">
          {agent.state?.model ?? 'N/A'}
        </p>
      </div>

      {/* Recent Activity */}
      {agentHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {agentHistory.slice(0, 8).map((entry) => {
              const scoreColor =
                entry.score >= 8
                  ? '#22c55e'
                  : entry.score >= 6
                    ? '#eab308'
                    : entry.score >= 4
                      ? '#f97316'
                      : '#ef4444'
              return (
                <div
                  key={entry.cycle}
                  className="flex items-start gap-3 p-2 rounded-lg bg-white/5"
                >
                  <span className="text-xs text-zinc-500 font-mono shrink-0 mt-0.5">
                    #{entry.cycle}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 truncate">
                      {entry.description || entry.task}
                    </div>
                    {entry.detailedTask && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {entry.detailedTask}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: scoreColor }}
                    >
                      {entry.score.toFixed(1)}
                    </span>
                    <span
                      className={`text-xs ${entry.status === 'keep' ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {entry.status === 'keep' ? '\u2713' : '\u2717'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agent color indicator */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">
          Agent Color
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
          <span className="text-sm text-gray-300">{agent.color}</span>
        </div>
      </div>

      {/* Avatar picker modal */}
      {showPicker && (
        <AvatarPicker
          agentId={agent.config.id}
          agentName={agent.config.name}
          currentImage={currentImage}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
