import { useState, useEffect, useRef } from 'react'
import type { Agent, AgentStatus, ResultRow } from '@tenshu/shared'
import type { CycleEntry, CurrentCycle } from './useAgentHistory'

// ── Demo agent definitions ──────────────────────────────────────────

const DEMO_AGENTS: Agent[] = [
  {
    config: {
      id: 'planner-erwin',
      name: 'Erwin',
      workspace: '/tmp/demo/erwin',
      model: { primary: 'qwen3.5:27b' },
    },
    state: { id: 'planner-erwin', status: 'idle' },
    color: '#f59e0b',
    emoji: '🧠',
  },
  {
    config: {
      id: 'researcher-senku',
      name: 'Senku',
      workspace: '/tmp/demo/senku',
      model: { primary: 'qwen3.5:27b' },
    },
    state: { id: 'researcher-senku', status: 'idle' },
    color: '#22c55e',
    emoji: '🔬',
  },
  {
    config: {
      id: 'coder-bulma',
      name: 'Bulma',
      workspace: '/tmp/demo/bulma',
      model: { primary: 'qwen3.5:27b' },
    },
    state: { id: 'coder-bulma', status: 'idle' },
    color: '#8b5cf6',
    emoji: '💻',
  },
  {
    config: {
      id: 'qa-vegeta',
      name: 'Vegeta',
      workspace: '/tmp/demo/vegeta',
      model: { primary: 'qwen3.5:27b' },
    },
    state: { id: 'qa-vegeta', status: 'idle' },
    color: '#ef4444',
    emoji: '🔥',
  },
  {
    config: {
      id: 'comms-jet',
      name: 'Jet',
      workspace: '/tmp/demo/jet',
      model: { primary: 'qwen3.5:27b' },
    },
    state: { id: 'comms-jet', status: 'idle' },
    color: '#06b6d4',
    emoji: '📡',
  },
]

const DEMO_TASKS = [
  'Implement authentication middleware',
  'Research vector database options',
  'Write unit tests for API routes',
  'Review code quality metrics',
  'Update deployment documentation',
  'Optimize database query performance',
  'Design notification system architecture',
  'Scan for security vulnerabilities',
  'Build data pipeline prototype',
  'Analyze user engagement metrics',
]

const DEMO_CYCLE_TASKS = [
  'ai-self-improvement-research',
  'tool-building',
  'capability-assessment',
  'frontier-scan',
  'repo-contribution',
  'resource-acquisition',
]

const STATUS_SEQUENCE: AgentStatus[] = [
  'idle',
  'thinking',
  'working',
  'working',
  'working',
  'idle',
]

function randomScore(): number {
  return Math.round((5 + Math.random() * 4.5) * 10) / 10
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Mock agents hook ────────────────────────────────────────────────

export function useMockAgents() {
  const [agents, setAgents] = useState<Agent[]>(DEMO_AGENTS)
  const tickRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++
      setAgents((prev) =>
        prev.map((agent, i) => {
          // Each agent cycles at different offsets
          const phase = (tickRef.current + i * 2) % STATUS_SEQUENCE.length
          const status = STATUS_SEQUENCE[phase]
          const isError = tickRef.current % 37 === i // rare error flash

          return {
            ...agent,
            state: {
              ...agent.state,
              status: isError ? 'error' : status,
              currentTask:
                status === 'working' || status === 'thinking'
                  ? pick(DEMO_TASKS)
                  : undefined,
              error: isError ? 'Connection timeout after 300s' : undefined,
              model: agent.config.model?.primary,
              lastActivity: new Date().toISOString(),
            },
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return { agents, loading: false, connected: true }
}

// ── Mock history hook ───────────────────────────────────────────────

const ROLES = ['planner', 'researcher', 'coder', 'qa', 'comms']

function generateHistory(limit: number): Record<string, CycleEntry[]> {
  const map: Record<string, CycleEntry[]> = {}
  for (const role of ROLES) {
    const entries: CycleEntry[] = []
    for (let i = 0; i < limit; i++) {
      const cycle = 42 - i
      entries.push({
        cycle,
        task: pick(DEMO_CYCLE_TASKS),
        score: randomScore(),
        status: Math.random() > 0.2 ? 'keep' : 'discard',
        description: pick(DEMO_TASKS),
        timestamp: new Date(Date.now() - i * 600_000).toISOString(),
        detailedTask: pick(DEMO_TASKS),
        verdict: Math.random() > 0.2 ? 'keep' : 'discard',
        resultLength: Math.floor(Math.random() * 30000) + 1000,
      })
    }
    map[role] = entries
  }
  return map
}

export function useMockAgentHistory(limit = 10) {
  const [data] = useState(() => generateHistory(limit))
  return { data, isLoading: false, error: null }
}

// ── Mock current cycle hook ─────────────────────────────────────────

const DEMO_LOG_LINES = [
  '▶ Cycle #42 starting — task: code-review',
  '  Delegating to Bulma (coder) — trust: 0.72',
  '  Bulma responded with 24,381 chars',
  '  Score: 7.8/10 — verdict: keep',
  '  Extracting code blocks from artifact...',
  '  Saved 2 files to workspace',
  '  Ralph Loop: result validated, committing',
  '  ✓ Cycle #42 complete in 4m 12s',
  '▶ Cycle #43 starting — task: improve-gameplay',
  '  Delegating to Senku (researcher) — trust: 0.68',
  '  Senku thinking...',
  '  Senku responded with 18,204 chars',
  '  Score: 8.2/10 — verdict: keep',
]

export function useMockCurrentCycle() {
  const [lineIndex, setLineIndex] = useState(0)
  const [cycleNum, setCycleNum] = useState(42)

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => {
        const next = prev + 1
        if (next >= DEMO_LOG_LINES.length) {
          setCycleNum((c) => c + 1)
          return 0
        }
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const current: CurrentCycle = {
    running: true,
    cycle: String(cycleNum),
    task: pick(DEMO_CYCLE_TASKS),
    lastAgent: pick(['Bulma', 'Senku', 'Vegeta', 'Erwin', 'Jet']),
    lastStatus: DEMO_LOG_LINES[lineIndex]?.slice(0, 60) ?? '',
    recentLines: DEMO_LOG_LINES.slice(
      Math.max(0, lineIndex - 3),
      lineIndex + 1,
    ),
  }

  return { data: current, isLoading: false, error: null }
}

// ── Mock results hook ───────────────────────────────────────────────

const DEMO_AGENT_ROLES = ['coder', 'researcher', 'qa', 'planner', 'comms']
const DEMO_STATUSES: ResultRow['status'][] = [
  'keep',
  'keep',
  'keep',
  'discard',
  'keep',
  'crash',
  'keep',
  'skip',
]

function generateResults(count: number): ResultRow[] {
  const rows: ResultRow[] = []
  for (let i = 0; i < count; i++) {
    const cycle = i + 1
    const agent = DEMO_AGENT_ROLES[i % DEMO_AGENT_ROLES.length]
    const status = DEMO_STATUSES[i % DEMO_STATUSES.length]
    rows.push({
      timestamp: new Date(Date.now() - (count - i) * 600_000).toISOString(),
      cycle,
      task: pick(DEMO_CYCLE_TASKS),
      agent,
      score:
        status === 'crash' ? 0 : Math.round((4 + Math.random() * 6) * 10) / 10,
      status,
      description: pick(DEMO_TASKS),
    })
  }
  return rows
}

export function useMockResults() {
  const [data] = useState(() => generateResults(25))
  return { data, isLoading: false }
}
