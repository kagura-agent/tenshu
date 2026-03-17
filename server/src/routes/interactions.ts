import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const RESULTS_TSV =
  process.env.RESULTS_TSV ||
  `${process.env.HOME}/clawd/team/knowledge/results.tsv`

export interface AgentNode {
  id: string
  name: string
  role: string
  tasksCompleted: number
  avgScore: number
}

export interface DelegationEdge {
  from: string
  to: string
  count: number
  avgScore: number
  tasks: string[]
}

const interactions = new Hono()

interactions.get('/', async (c) => {
  try {
    if (!existsSync(RESULTS_TSV)) {
      return c.json({ nodes: [], edges: [] })
    }

    const raw = await readFile(RESULTS_TSV, 'utf-8')
    const lines = raw.trim().split('\n').slice(1) // skip header

    // Parse results
    const results: Array<{
      cycle: number
      agent: string
      task: string
      score: number
      status: string
    }> = []
    for (const line of lines) {
      const [, cycle, task, agent, score, status] = line.split('\t')
      results.push({
        cycle: Number(cycle),
        agent,
        task,
        score: Number(score),
        status,
      })
    }

    // Build node stats
    const agentStats: Record<
      string,
      { tasks: number; totalScore: number; scoreCount: number }
    > = {}
    for (const r of results) {
      if (!agentStats[r.agent])
        agentStats[r.agent] = { tasks: 0, totalScore: 0, scoreCount: 0 }
      agentStats[r.agent].tasks++
      if (r.score > 0) {
        agentStats[r.agent].totalScore += r.score
        agentStats[r.agent].scoreCount++
      }
    }

    const AGENT_NAMES: Record<string, string> = {
      researcher: 'Senku',
      coder: 'Bulma',
      qa: 'Vegeta',
      planner: 'Erwin',
      comms: 'Jet',
    }

    const nodes: AgentNode[] = Object.entries(agentStats).map(([id, s]) => ({
      id,
      name: AGENT_NAMES[id] || id,
      role: id,
      tasksCompleted: s.tasks,
      avgScore:
        s.scoreCount > 0
          ? Math.round((s.totalScore / s.scoreCount) * 10) / 10
          : 0,
    }))

    // Infer delegation edges from cycle sequences
    // Standard flow: planner → researcher → coder → qa
    // Count how many times each pair appears in the same cycle
    const cycleMap = new Map<number, string[]>()
    for (const r of results) {
      if (!cycleMap.has(r.cycle)) cycleMap.set(r.cycle, [])
      const agents = cycleMap.get(r.cycle)!
      if (!agents.includes(r.agent)) agents.push(r.agent)
    }

    const edgeCounts: Record<
      string,
      { count: number; scores: number[]; tasks: Set<string> }
    > = {}
    const FLOW_ORDER = ['planner', 'researcher', 'coder', 'qa']

    for (const [cycleNum, agents] of cycleMap) {
      // Sort agents by standard flow order
      const ordered = agents
        .filter((a) => FLOW_ORDER.includes(a))
        .sort((a, b) => FLOW_ORDER.indexOf(a) - FLOW_ORDER.indexOf(b))

      // Get cycle score
      const cycleResults = results.filter((r) => r.cycle === cycleNum)
      const finalScore = cycleResults[cycleResults.length - 1]?.score || 0
      const task = cycleResults[0]?.task || ''

      // Create edges between consecutive agents in the flow
      for (let i = 0; i < ordered.length - 1; i++) {
        const key = `${ordered[i]}->${ordered[i + 1]}`
        if (!edgeCounts[key])
          edgeCounts[key] = { count: 0, scores: [], tasks: new Set() }
        edgeCounts[key].count++
        if (finalScore > 0) edgeCounts[key].scores.push(finalScore)
        edgeCounts[key].tasks.add(task)
      }
    }

    const edges: DelegationEdge[] = Object.entries(edgeCounts).map(
      ([key, data]) => {
        const [from, to] = key.split('->')
        return {
          from,
          to,
          count: data.count,
          avgScore:
            data.scores.length > 0
              ? Math.round(
                  (data.scores.reduce((a, b) => a + b, 0) /
                    data.scores.length) *
                    10,
                ) / 10
              : 0,
          tasks: [...data.tasks].slice(0, 5),
        }
      },
    )

    return c.json({ nodes, edges })
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

export default interactions
