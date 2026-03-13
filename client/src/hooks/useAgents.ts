import { useState, useEffect } from "react";
import type { Agent, AgentState } from "@tenshu/shared";
import { useWebSocket } from "./useWebSocket";
import { useDemo } from "./useDemo";
import { useMockAgents } from "./useMockData";

export function useAgents() {
  const { isDemo } = useDemo();
  const mock = useMockAgents();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    if (isDemo) return;
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
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) return;
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
  }, [subscribe, isDemo]);

  if (isDemo) return mock;
  return { agents, loading, connected };
}
