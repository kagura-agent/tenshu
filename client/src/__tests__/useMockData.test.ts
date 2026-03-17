import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useMockAgents,
  useMockAgentHistory,
  useMockCurrentCycle,
} from '../hooks/useMockData'

describe('useMockAgents', () => {
  it('returns 5 demo agents immediately', () => {
    const { result } = renderHook(() => useMockAgents())
    expect(result.current.agents).toHaveLength(5)
    expect(result.current.loading).toBe(false)
    expect(result.current.connected).toBe(true)
  })

  it('each agent has required fields', () => {
    const { result } = renderHook(() => useMockAgents())
    for (const agent of result.current.agents) {
      expect(agent.config.id).toBeTruthy()
      expect(agent.config.name).toBeTruthy()
      expect(agent.state.id).toBe(agent.config.id)
      expect(agent.state.status).toBeDefined()
      expect(agent.color).toMatch(/^#/)
    }
  })

  it('includes all five roles', () => {
    const { result } = renderHook(() => useMockAgents())
    const ids = result.current.agents.map((a) => a.config.id)
    expect(ids).toContain('planner-erwin')
    expect(ids).toContain('researcher-senku')
    expect(ids).toContain('coder-bulma')
    expect(ids).toContain('qa-vegeta')
    expect(ids).toContain('comms-jet')
  })
})

describe('useMockAgentHistory', () => {
  it('returns history for all 5 roles', () => {
    const { result } = renderHook(() => useMockAgentHistory(8))
    const roles = Object.keys(result.current.data)
    expect(roles).toContain('planner')
    expect(roles).toContain('researcher')
    expect(roles).toContain('coder')
    expect(roles).toContain('qa')
    expect(roles).toContain('comms')
  })

  it('respects the limit parameter', () => {
    const { result } = renderHook(() => useMockAgentHistory(3))
    for (const entries of Object.values(result.current.data)) {
      expect(entries).toHaveLength(3)
    }
  })

  it('entries have valid scores between 0 and 10', () => {
    const { result } = renderHook(() => useMockAgentHistory(8))
    for (const entries of Object.values(result.current.data)) {
      for (const entry of entries) {
        expect(entry.score).toBeGreaterThanOrEqual(0)
        expect(entry.score).toBeLessThanOrEqual(10)
      }
    }
  })
})

describe('useMockCurrentCycle', () => {
  it('returns a running cycle', () => {
    const { result } = renderHook(() => useMockCurrentCycle())
    expect(result.current.data.running).toBe(true)
    expect(result.current.data.cycle).toBeDefined()
    expect(result.current.data.task).toBeTruthy()
    expect(result.current.data.recentLines.length).toBeGreaterThan(0)
  })
})
