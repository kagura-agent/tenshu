import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WSContext } from 'hono/ws'
import type { WSMessage } from '@tenshu/shared'

// Each test needs a fresh module to reset the internal `clients` Set
async function loadHandler() {
  // vitest module isolation: re-import for a clean clients Set
  const mod = await import('../ws/handler.js')
  return mod
}

function createMockWS(): WSContext & { sentMessages: string[] } {
  const sentMessages: string[] = []
  const ws = new WSContext({
    send(data: string | ArrayBuffer | Uint8Array) {
      sentMessages.push(
        typeof data === 'string'
          ? data
          : new TextDecoder().decode(data as Uint8Array),
      )
    },
    close() {},
    readyState: 1,
  })
  // Attach sentMessages for assertions
  ;(ws as any).sentMessages = sentMessages
  return ws as WSContext & { sentMessages: string[] }
}

// We must reset the module between tests to clear the clients Set
// Using dynamic imports with vi.resetModules()

describe('WebSocket handler', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('addClient', () => {
    it('sends a connected message with clientCount to the new client', async () => {
      const { addClient } = await loadHandler()
      const ws = createMockWS()

      addClient(ws)

      expect(ws.sentMessages).toHaveLength(1)
      const msg: WSMessage = JSON.parse(ws.sentMessages[0])
      expect(msg.type).toBe('connected')
      expect(msg.payload).toEqual({ clientCount: 1 })
      expect(msg.timestamp).toBeDefined()
    })

    it('increments clientCount for each new client', async () => {
      const { addClient } = await loadHandler()
      const ws1 = createMockWS()
      const ws2 = createMockWS()

      addClient(ws1)
      addClient(ws2)

      const msg2: WSMessage = JSON.parse(ws2.sentMessages[0])
      expect(msg2.payload).toEqual({ clientCount: 2 })
    })

    it('does not duplicate when adding the same client twice', async () => {
      const { addClient, getClientCount } = await loadHandler()
      const ws = createMockWS()

      addClient(ws)
      addClient(ws)

      // Set deduplicates, so count should still be 1
      expect(getClientCount()).toBe(1)
    })
  })

  describe('removeClient', () => {
    it('removes a client from the pool', async () => {
      const { addClient, removeClient, getClientCount } = await loadHandler()
      const ws = createMockWS()

      addClient(ws)
      expect(getClientCount()).toBe(1)

      removeClient(ws)
      expect(getClientCount()).toBe(0)
    })

    it('is a no-op for an unknown client', async () => {
      const { removeClient, getClientCount } = await loadHandler()
      const ws = createMockWS()

      removeClient(ws)
      expect(getClientCount()).toBe(0)
    })
  })

  describe('getClientCount', () => {
    it('returns 0 when no clients are connected', async () => {
      const { getClientCount } = await loadHandler()
      expect(getClientCount()).toBe(0)
    })

    it('reflects additions and removals', async () => {
      const { addClient, removeClient, getClientCount } = await loadHandler()
      const ws1 = createMockWS()
      const ws2 = createMockWS()

      expect(getClientCount()).toBe(0)
      addClient(ws1)
      expect(getClientCount()).toBe(1)
      addClient(ws2)
      expect(getClientCount()).toBe(2)
      removeClient(ws1)
      expect(getClientCount()).toBe(1)
    })
  })

  describe('broadcast', () => {
    it('sends a message to all connected clients', async () => {
      const { addClient, broadcast } = await loadHandler()
      const ws1 = createMockWS()
      const ws2 = createMockWS()

      addClient(ws1)
      addClient(ws2)

      // Clear the "connected" messages
      ws1.sentMessages.length = 0
      ws2.sentMessages.length = 0

      broadcast('agent:status', { id: 'test-agent', status: 'working' })

      expect(ws1.sentMessages).toHaveLength(1)
      expect(ws2.sentMessages).toHaveLength(1)

      const msg1: WSMessage = JSON.parse(ws1.sentMessages[0])
      expect(msg1.type).toBe('agent:status')
      expect(msg1.payload).toEqual({ id: 'test-agent', status: 'working' })
      expect(msg1.timestamp).toBeDefined()

      // Both clients receive identical content
      expect(ws1.sentMessages[0]).toBe(ws2.sentMessages[0])
    })

    it('does not send to removed clients', async () => {
      const { addClient, removeClient, broadcast } = await loadHandler()
      const ws1 = createMockWS()
      const ws2 = createMockWS()

      addClient(ws1)
      addClient(ws2)
      removeClient(ws1)

      ws1.sentMessages.length = 0
      ws2.sentMessages.length = 0

      broadcast('agent:activity', { event: 'file_changed' })

      expect(ws1.sentMessages).toHaveLength(0)
      expect(ws2.sentMessages).toHaveLength(1)
    })

    it('removes clients that throw on send', async () => {
      const { addClient, broadcast, getClientCount } = await loadHandler()

      // Create a client that works initially but fails on subsequent sends
      let callCount = 0
      const broken = new WSContext({
        send() {
          callCount++
          if (callCount > 1) {
            throw new Error('connection reset')
          }
        },
        close() {},
        readyState: 1,
      })

      const healthy = createMockWS()

      addClient(broken) // first send succeeds (connected message)
      addClient(healthy)
      expect(getClientCount()).toBe(2)

      healthy.sentMessages.length = 0

      broadcast('agent:status', { id: 'x', status: 'idle' }) // broken throws here

      // Broken client should have been removed
      expect(getClientCount()).toBe(1)
      // Healthy client still gets the message
      expect(healthy.sentMessages).toHaveLength(1)
    })

    it('sends nothing when there are no clients', async () => {
      const { broadcast, getClientCount } = await loadHandler()
      // Should not throw
      expect(() => broadcast('connected', { info: 'test' })).not.toThrow()
      expect(getClientCount()).toBe(0)
    })

    it('produces valid WSMessage JSON with ISO timestamp', async () => {
      const { addClient, broadcast } = await loadHandler()
      const ws = createMockWS()
      addClient(ws)
      ws.sentMessages.length = 0

      broadcast('session:update', { sessionId: 's1', tokens: 1500 })

      const msg: WSMessage = JSON.parse(ws.sentMessages[0])
      expect(msg.type).toBe('session:update')
      expect(msg.payload).toEqual({ sessionId: 's1', tokens: 1500 })
      // Verify timestamp is a valid ISO string
      expect(new Date(msg.timestamp).toISOString()).toBe(msg.timestamp)
    })
  })

  describe('connection lifecycle', () => {
    it('handles open → message → close cycle', async () => {
      const { addClient, removeClient, broadcast, getClientCount } =
        await loadHandler()
      const ws = createMockWS()

      // Open
      addClient(ws)
      expect(getClientCount()).toBe(1)
      expect(ws.sentMessages).toHaveLength(1) // connected message

      // Receive broadcast (simulating server-side event)
      ws.sentMessages.length = 0
      broadcast('cron:run', { jobId: 'j1', status: 'running' })
      expect(ws.sentMessages).toHaveLength(1)
      const msg: WSMessage = JSON.parse(ws.sentMessages[0])
      expect(msg.type).toBe('cron:run')

      // Close
      removeClient(ws)
      expect(getClientCount()).toBe(0)

      // After close, broadcasts should not reach this client
      ws.sentMessages.length = 0
      broadcast('agent:status', { id: 'a1', status: 'offline' })
      expect(ws.sentMessages).toHaveLength(0)
    })
  })

  describe('message serialization', () => {
    it('broadcast handles all WSMessage types', async () => {
      const { addClient, broadcast } = await loadHandler()
      const ws = createMockWS()
      addClient(ws)

      const types: WSMessage['type'][] = [
        'agent:status',
        'agent:activity',
        'session:update',
        'cron:run',
        'connected',
      ]

      ws.sentMessages.length = 0

      for (const type of types) {
        broadcast(type, { test: true })
      }

      expect(ws.sentMessages).toHaveLength(types.length)

      for (let i = 0; i < types.length; i++) {
        const msg: WSMessage = JSON.parse(ws.sentMessages[i])
        expect(msg.type).toBe(types[i])
      }
    })

    it('broadcast serializes complex payloads correctly', async () => {
      const { addClient, broadcast } = await loadHandler()
      const ws = createMockWS()
      addClient(ws)
      ws.sentMessages.length = 0

      const complexPayload = {
        nested: { deep: { value: 42 } },
        array: [1, 'two', null],
        unicode: '天守閣',
      }

      broadcast('agent:activity', complexPayload)

      const msg: WSMessage = JSON.parse(ws.sentMessages[0])
      expect(msg.payload).toEqual(complexPayload)
    })
  })
})
