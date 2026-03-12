import { watch } from "chokidar";
import { getConfig } from "../openclaw/config.js";
import { fetchActiveSessions } from "../openclaw/gateway.js";
import { broadcast } from "./handler.js";
import type { AgentState } from "@tenshu/shared";

let previousStates = new Map<string, AgentState>();

export function startGatewayPoller(intervalMs = 5000): NodeJS.Timeout {
  return setInterval(async () => {
    const sessions = await fetchActiveSessions();
    const currentMap = new Map(sessions.map((s) => [s.id, s]));

    // Broadcast only changes
    for (const [id, state] of currentMap) {
      const prev = previousStates.get(id);
      if (!prev || prev.status !== state.status || prev.currentTask !== state.currentTask) {
        broadcast("agent:status", state);
      }
    }

    // Detect agents that went offline
    for (const [id] of previousStates) {
      if (!currentMap.has(id)) {
        broadcast("agent:status", { id, status: "offline" });
      }
    }

    previousStates = currentMap;
  }, intervalMs);
}

export function startWorkspaceWatchers(): void {
  const { agents } = getConfig();

  for (const agent of agents) {
    if (!agent.workspace) continue;

    const watcher = watch(agent.workspace, {
      ignoreInitial: true,
      depth: 2,
      ignored: /(^|[/\\])\./,
    });

    watcher.on("change", (path) => {
      broadcast("agent:activity", {
        agentId: agent.id,
        event: "file_changed",
        path,
        timestamp: new Date().toISOString(),
      });
    });

    watcher.on("add", (path) => {
      broadcast("agent:activity", {
        agentId: agent.id,
        event: "file_created",
        path,
        timestamp: new Date().toISOString(),
      });
    });
  }
}
