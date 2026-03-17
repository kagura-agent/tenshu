import { Hono } from 'hono'
import { getConfig } from '../openclaw/config.js'
import { fetchActiveSessions } from '../openclaw/gateway.js'
import { AGENT_COLORS } from '@tenshu/shared'
import type { Agent, AgentState } from '@tenshu/shared'

const agents = new Hono()

agents.get('/', async (c) => {
  const { agents: agentConfigs } = getConfig()
  const activeSessions = await fetchActiveSessions()

  const sessionMap = new Map(activeSessions.map((s) => [s.id, s]))

  const result: Agent[] = agentConfigs.map((config, i) => {
    const session = sessionMap.get(config.id)
    const state: AgentState = session ?? {
      id: config.id,
      status: 'offline',
    }

    return {
      config,
      state,
      color: AGENT_COLORS[i % AGENT_COLORS.length],
      emoji: config.default ? '\u{1F99E}' : '\u{1F916}',
    }
  })

  return c.json(result)
})

export default agents
