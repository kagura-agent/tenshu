import { useQuery } from "@tanstack/react-query";

export interface CycleEntry {
  cycle: number;
  task: string;
  score: number;
  status: string;
  description: string;
  timestamp: string;
  detailedTask: string;
  verdict: string;
  resultLength: number;
}

type AgentHistoryMap = Record<string, CycleEntry[]>;

export function useAgentHistory(limit = 10) {
  return useQuery<AgentHistoryMap>({
    queryKey: ["agent-history", limit],
    queryFn: () =>
      fetch(`/api/activity/agent-history?limit=${limit}`).then((r) => r.json()),
    refetchInterval: 15000,
  });
}

export interface CurrentCycle {
  running: boolean;
  cycle: string;
  task: string;
  lastAgent: string;
  lastStatus: string;
  recentLines: string[];
}

export function useCurrentCycle() {
  return useQuery<CurrentCycle>({
    queryKey: ["activity-current"],
    queryFn: () => fetch("/api/activity/current").then((r) => r.json()),
    refetchInterval: 5000,
  });
}
