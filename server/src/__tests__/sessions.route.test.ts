import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../openclaw/cli.js', () => ({
  listSessions: vi.fn(),
}))

import { listSessions } from '../openclaw/cli.js'
import type { Session } from '@tenshu/shared'

const mockedListSessions = vi.mocked(listSessions)

describe('sessions route', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()

    const mod = await import('../routes/sessions.js')
    app = new Hono()
    app.route('/sessions', mod.default)
  })

  describe('GET /', () => {
    it('returns list of sessions', async () => {
      const sessions: Session[] = [
        {
          id: 'sess-1',
          agentId: 'agent-1',
          label: 'main',
          startedAt: '2026-03-19T04:00:00.000Z',
          lastActivity: '2026-03-19T04:30:00.000Z',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
          model: 'claude-sonnet-4-20250514',
          cost: 0,
        },
        {
          id: 'sess-2',
          agentId: 'agent-2',
          startedAt: '2026-03-19T03:00:00.000Z',
          lastActivity: '2026-03-19T03:15:00.000Z',
          inputTokens: 200,
          outputTokens: 100,
          totalTokens: 300,
          model: 'unknown',
          cost: 0,
        },
      ]
      mockedListSessions.mockResolvedValue(sessions)

      const res = await app.request('/sessions')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual(sessions)
      expect(body).toHaveLength(2)
    })

    it('returns empty array when no sessions exist', async () => {
      mockedListSessions.mockResolvedValue([])

      const res = await app.request('/sessions')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual([])
    })

    it('returns 500 when listSessions fails', async () => {
      mockedListSessions.mockRejectedValue(
        new Error('openclaw sessions failed: command not found'),
      )

      const res = await app.request('/sessions')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe(
        'openclaw sessions failed: command not found',
      )
    })
  })
})
