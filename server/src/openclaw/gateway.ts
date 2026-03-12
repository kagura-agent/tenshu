import type { AgentState } from "@tenshu/shared";
import { listSessions } from "./cli.js";

export async function fetchActiveSessions(): Promise<AgentState[]> {
  try {
    const sessions = await listSessions();

    // Sessions with recent activity (within last 5 minutes) are "working"
    const now = Date.now();
    const ACTIVE_THRESHOLD = 5 * 60 * 1000;

    return sessions.map((s) => {
      const lastMs = s.lastActivity ? new Date(s.lastActivity).getTime() : 0;
      const isActive = now - lastMs < ACTIVE_THRESHOLD;

      return {
        id: s.agentId,
        status: isActive ? ("working" as const) : ("idle" as const),
        currentTask: s.label,
        sessionId: s.id,
        lastActivity: s.lastActivity,
        model: s.model,
      };
    });
  } catch {
    return [];
  }
}
