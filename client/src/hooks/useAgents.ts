import { useState, useEffect } from "react";
import type { Agent, AgentState } from "@tenshu/shared";
import { useWebSocket } from "./useWebSocket";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: Agent[]) => {
        setAgents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[tenshu] Failed to fetch agents:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type === "agent:status") {
        const update = msg.payload as AgentState;
        setAgents((prev) =>
          prev.map((agent) =>
            agent.config.id === update.id
              ? { ...agent, state: { ...agent.state, ...update } }
              : agent
          )
        );
      }
    });
  }, [subscribe]);

  return { agents, loading, connected };
}
