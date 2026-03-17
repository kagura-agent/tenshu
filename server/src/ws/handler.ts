import type { WSContext } from 'hono/ws'
import type { WSMessage } from '@tenshu/shared'

const clients = new Set<WSContext>()

export function addClient(ws: WSContext): void {
  clients.add(ws)
  const msg: WSMessage = {
    type: 'connected',
    payload: { clientCount: clients.size },
    timestamp: new Date().toISOString(),
  }
  ws.send(JSON.stringify(msg))
}

export function removeClient(ws: WSContext): void {
  clients.delete(ws)
}

export function broadcast(type: WSMessage['type'], payload: unknown): void {
  const msg: WSMessage = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  }
  const data = JSON.stringify(msg)
  for (const client of clients) {
    try {
      client.send(data)
    } catch {
      clients.delete(client)
    }
  }
}

export function getClientCount(): number {
  return clients.size
}
