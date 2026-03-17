import { useMemo } from 'react'
import type { Agent } from '@tenshu/shared'
import { STATUS_COLORS } from '@tenshu/shared'
import { AgentSprite } from './sprites'
import { AnimatedCanvas } from './AnimatedCanvas'
import { Sparkline } from '@/components/Sparkline'
import { useAgentHistory, useCurrentCycle } from '@/hooks/useAgentHistory'
import type { CycleEntry } from '@/hooks/useAgentHistory'

interface ControlDeckProps {
  agents: Agent[]
  onSelectAgent: (agent: Agent) => void
  selectedAgentId: string | null
}

const STATUS_KANJI: Record<string, string> = {
  working: '稼働',
  thinking: '思考',
  idle: '待機',
  error: '異常',
  offline: '不在',
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

function TerminalFeed({ lines }: { lines: string[] }) {
  const display = lines.slice(-6)

  function lineColor(line: string, isNewest: boolean): string {
    if (/error/i.test(line)) return 'text-red-400'
    if (/responded/i.test(line)) return 'text-cyan-400'
    return isNewest ? 'text-emerald-400' : 'text-emerald-400/40'
  }

  return (
    <div className="w-[28rem] font-mono text-[10px] leading-relaxed bg-black/40 rounded-lg border border-emerald-500/10 p-3 shrink-0 overflow-hidden">
      {display.length === 0 && (
        <div className="text-emerald-400/40">{'>> awaiting data...'}</div>
      )}
      {display.map((line, i) => (
        <div
          key={`${i}-${line}`}
          className={`${lineColor(line, i === display.length - 1)} truncate`}
        >
          {line}
        </div>
      ))}
      <div className="text-emerald-400 animate-pulse">_</div>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 8
      ? '#22c55e'
      : score >= 6
        ? '#eab308'
        : score >= 4
          ? '#f97316'
          : '#ef4444'
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

function MiniHistory({ entries }: { entries: CycleEntry[] }) {
  if (!entries.length) return null
  const scores = entries.map((e) => e.score)
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Sparkline values={scores} width={48} height={12} />
        <span className="text-[7px] text-zinc-600">
          {entries.length} cycles
        </span>
      </div>
      {entries.slice(0, 3).map((e) => (
        <div key={e.cycle} className="flex items-center gap-1.5 text-[8px]">
          <span className="text-zinc-600 shrink-0">#{e.cycle}</span>
          <span
            className="text-zinc-400 truncate flex-1"
            title={e.detailedTask || e.description}
          >
            {e.description || e.task}
          </span>
          <ScoreBar score={e.score} />
        </div>
      ))}
    </div>
  )
}

export function ControlDeck({
  agents,
  onSelectAgent,
  selectedAgentId,
}: ControlDeckProps) {
  const { data: history } = useAgentHistory(8)
  const { data: current } = useCurrentCycle()

  const intensity = useMemo(() => {
    const activeCount = agents.filter(
      (a) => a.state?.status === 'working' || a.state?.status === 'thinking',
    ).length
    return Math.min(1, activeCount / Math.max(agents.length, 1))
  }, [agents])

  return (
    <div
      className="w-full h-full overflow-hidden relative flex flex-col"
      style={{
        background: '#08081a',
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/backgrounds/command_deck_0.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
        }}
      />
      <AnimatedCanvas theme="deck" intensity={intensity} />

      {/* CRT scan lines */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.04]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 h-14 shrink-0 flex items-center justify-center">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400/40" />
          <span className="text-cyan-400/80 text-sm tracking-[0.4em] font-light">
            天守 COMMAND CENTER
          </span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400/40" />
        </div>
        {/* Status dots top right */}
        <div className="absolute right-4 flex items-center gap-3">
          {agents.map((a) => {
            const s = a.state?.status ?? 'offline'
            const c = STATUS_COLORS[s] ?? STATUS_COLORS.offline
            return (
              <div key={a.config.id} className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${s === 'working' || s === 'thinking' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: c }}
                />
                <span className="text-[10px] text-zinc-400">
                  {a.config.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current cycle banner */}
      {current?.running && (
        <div
          className="relative z-20 mx-auto mt-1 flex items-center gap-3 px-4 py-1.5 rounded border border-cyan-500/20"
          style={{
            background: 'rgba(6, 182, 212, 0.05)',
          }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-300/80 font-mono">
            Cycle #{current.cycle} — {current.task}
          </span>
          {current.lastStatus && (
            <span className="text-[10px] text-cyan-200/40">
              {current.lastStatus}
            </span>
          )}
        </div>
      )}

      {/* Agent stations */}
      <div className="flex-1 flex items-center justify-center z-10 px-4 py-4">
        <div className="flex items-start gap-4 flex-wrap justify-center max-w-5xl">
          {agents.map((agent) => {
            const status = agent.state?.status ?? 'offline'
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline
            const role = guessRole(agent)
            const isSelected = selectedAgentId === agent.config.id
            const isActive = status === 'working' || status === 'thinking'
            const isError = status === 'error'
            const agentHistory = history?.[role] || []

            return (
              <button
                key={agent.config.id}
                onClick={() => onSelectAgent(agent)}
                className={`group focus:outline-none flex flex-col items-center transition-all duration-300 ${
                  isSelected ? '-translate-y-2' : 'hover:-translate-y-1'
                } ${isError ? 'animate-error-shake' : ''}`}
              >
                {/* Monitor + sprite */}
                <div className="relative">
                  {isActive && (
                    <div
                      className="absolute -inset-4 rounded-2xl"
                      style={{
                        background: `radial-gradient(ellipse, ${agent.color}15 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Monitor frame */}
                  <div
                    className="w-44 rounded-lg border-2 relative overflow-hidden"
                    style={{
                      borderColor: isError
                        ? 'rgba(239, 68, 68, 0.6)'
                        : isSelected
                          ? `${agent.color}88`
                          : 'rgba(100, 100, 160, 0.25)',
                      background: isError
                        ? 'linear-gradient(135deg, #1e0c0c 0%, #2e1616 100%)'
                        : 'linear-gradient(135deg, #0c0c1e 0%, #16162e 100%)',
                      boxShadow: isError
                        ? '0 0 30px rgba(239, 68, 68, 0.2), 0 8px 24px rgba(0,0,0,0.5)'
                        : isSelected
                          ? `0 0 30px ${agent.color}25, 0 8px 24px rgba(0,0,0,0.5)`
                          : '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Status bar */}
                    <div
                      className="flex items-center justify-between px-2 py-1.5"
                      style={{
                        background: `linear-gradient(90deg, ${statusColor}15 0%, transparent 100%)`,
                        borderBottom: `1px solid ${statusColor}22`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                          style={{ backgroundColor: statusColor }}
                        />
                        <span
                          className="text-[9px] font-mono font-bold"
                          style={{ color: statusColor }}
                        >
                          {STATUS_KANJI[status]}
                        </span>
                      </div>
                      <span className="text-[8px] text-zinc-500 font-mono">
                        {agent.state?.model?.split(':')[0] || '—'}
                      </span>
                    </div>

                    {/* Screen: current task + history */}
                    <div className="p-2 min-h-[60px]">
                      {agent.state?.currentTask ? (
                        <div className="text-[9px] text-zinc-400 line-clamp-2">
                          {agent.state.currentTask}
                        </div>
                      ) : (
                        <div className="text-[9px] text-zinc-600 italic">
                          idle
                        </div>
                      )}
                      {isError && agent.state?.error && (
                        <div className="mt-1 px-1.5 py-0.5 rounded text-[8px] text-red-300 bg-red-900/20 border border-red-500/20 truncate">
                          {agent.state.error}
                        </div>
                      )}
                      <MiniHistory entries={agentHistory} />
                    </div>
                  </div>

                  {/* Monitor stand */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-4 bg-zinc-700 border-x border-zinc-600/30" />
                    <div className="w-10 h-1.5 rounded-full bg-zinc-700 border border-zinc-600/20" />
                  </div>

                  {/* Character portrait */}
                  <div className="absolute -bottom-2 -left-8">
                    <AgentSprite
                      agentId={agent.config.id}
                      agentName={agent.config.name}
                      size={72}
                      glow={isActive ? statusColor : undefined}
                      isActive={isActive}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="mt-3 flex flex-col items-center">
                  <span
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color: isSelected
                        ? agent.color
                        : 'rgba(210, 210, 230, 0.8)',
                      textShadow: isSelected
                        ? `0 0 12px ${agent.color}44`
                        : 'none',
                    }}
                  >
                    {agent.config.name}
                  </span>
                  <span className="text-[9px] text-zinc-600">{role}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer: terminal + decorations */}
      <div className="relative z-10 h-32 shrink-0 flex items-end px-4 pb-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <TerminalFeed lines={current?.recentLines || []} />

        {/* Torii gate */}
        <svg
          className="absolute bottom-4 right-8 opacity-[0.06]"
          width="80"
          height="100"
          viewBox="0 0 80 100"
        >
          <rect x="8" y="20" width="6" height="80" fill="#ef4444" />
          <rect x="66" y="20" width="6" height="80" fill="#ef4444" />
          <rect x="0" y="10" width="80" height="6" rx="2" fill="#ef4444" />
          <rect x="4" y="20" width="72" height="4" fill="#ef4444" />
        </svg>

        {/* Wave pattern */}
        <svg
          className="absolute bottom-4 left-[280px] opacity-[0.05]"
          width="100"
          height="40"
          viewBox="0 0 80 40"
        >
          <path
            d="M0 15 Q10 5 20 15 Q30 25 40 15 Q50 5 60 15 Q70 25 80 15"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <path
            d="M0 25 Q10 15 20 25 Q30 35 40 25 Q50 15 60 25 Q70 35 80 25"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}
