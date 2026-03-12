import type { AgentState } from "@tenshu/shared";
import { getConfig } from "./config.js";

interface GatewaySession {
  agentId: string;
  sessionId: string;
  label?: string;
  lastActivity?: string;
}

export async function fetchActiveSessions(): Promise<AgentState[]> {
  const { gatewayPort, gatewayToken } = getConfig();
  const url = `http://localhost:${gatewayPort}/api/sessions`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${gatewayToken}` },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return [];

    const sessions: GatewaySession[] = await res.json();

    return sessions.map((s) => ({
      id: s.agentId,
      status: "working" as const,
      currentTask: s.label,
      sessionId: s.sessionId,
      lastActivity: s.lastActivity,
    }));
  } catch {
    // Gateway may be offline — that's fine
    return [];
  }
}
