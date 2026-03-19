import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// Mock the dependencies before importing the route
vi.mock('../openclaw/config.js', () => ({
  getConfig: vi.fn(),
}))

vi.mock('../openclaw/gateway.js', () => ({
  fetchActiveSessions: vi.fn(),
}))

// AGENT_COLORS needs to be a real array for index math
vi.mock('@tenshu/shared', () => ({
  AGENT_COLORS: [
    '#ff6b35',
    '#FFCC00',
    '#4CAF50',
    '#E91E63',
    '#0077B5',
    '#9C27B0',
    '#00BCD4',
    '#FF5722',
  ],
}))

import { getConfig } from '../openclaw/config.js'
import { fetchActiveSessions } from '../openclaw/gateway.js'
import type { AgentConfig, AgentState } from '@tenshu/shared'

const mockedGetConfig = vi.mocked(getConfig)
const mockedFetchActiveSessions = vi.mocked(fetchActiveSessions)

describe('agents route', () => {
  let app: Hono

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    // Re-import after mocks are set
    const mod = await import('../routes/agents.js')
    app = new Hono()
    app.route('/agents', mod.default)
  })

  it('returns agents with state and color for each config entry', async () => {
    const agentConfigs: AgentConfig[] = [
      { id: 'agent-1', name: 'Senku', workspace: '/ws/senku' },
      { id: 'agent-2', name: 'Bulma', workspace: '/ws/bulma', default: true },
    ]

    const activeSessions: AgentState[] = [
      { id: 'agent-1', status: 'working', currentTask: 'code-review' },
    ]

    mockedGetConfig.mockReturnValue({
      agents: agentConfigs,
      gatewayPort: 18789,
      gatewayToken: 'test-token',
    })
    mockedFetchActiveSessions.mockResolvedValue(activeSessions)

    const res = await app.request('/agents')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toHaveLength(2)

    // First agent has an active session
    expect(body[0].config.id).toBe('agent-1')
    expect(body[0].state.status).toBe('working')
    expect(body[0].state.currentTask).toBe('code-review')
    expect(body[0].color).toBe('#ff6b35')
    expect(body[0].emoji).toBe('\u{1F916}') // 🤖 — not default

    // Second agent has no session → offline
    expect(body[1].config.id).toBe('agent-2')
    expect(body[1].state.status).toBe('offline')
    expect(body[1].color).toBe('#FFCC00')
    expect(body[1].emoji).toBe('\u{1F99E}') // 🦞 — default agent
  })

  it('returns empty array when no agents configured', async () => {
    mockedGetConfig.mockReturnValue({
      agents: [],
      gatewayPort: 18789,
      gatewayToken: '',
    })
    mockedFetchActiveSessions.mockResolvedValue([])

    const res = await app.request('/agents')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toHaveLength(0)
  })

  it('wraps AGENT_COLORS when more agents than colors', async () => {
    // 9 agents but only 8 colors → color should wrap
    const agentConfigs: AgentConfig[] = Array.from({ length: 9 }, (_, i) => ({
      id: `agent-${i}`,
      name: `Agent${i}`,
      workspace: `/ws/agent-${i}`,
    }))

    mockedGetConfig.mockReturnValue({
      agents: agentConfigs,
      gatewayPort: 18789,
      gatewayToken: '',
    })
    mockedFetchActiveSessions.mockResolvedValue([])

    const res = await app.request('/agents')
    const body = await res.json()

    // Agent index 8 should wrap to color index 0
    expect(body[8].color).toBe('#ff6b35')
  })

  it('assigns offline state when agent has no active session', async () => {
    mockedGetConfig.mockReturnValue({
      agents: [{ id: 'lonely', name: 'Lonely', workspace: '/ws/lonely' }],
      gatewayPort: 18789,
      gatewayToken: '',
    })
    mockedFetchActiveSessions.mockResolvedValue([])

    const res = await app.request('/agents')
    const body = await res.json()

    expect(body[0].state).toEqual({ id: 'lonely', status: 'offline' })
  })
})
