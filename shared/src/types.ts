// Agent configuration — read from openclaw.json agents.list[]
export interface AgentConfig {
  id: string;
  name: string;
  workspace: string;
  default?: boolean;
  model?: {
    primary: string;
    fallbacks?: string[];
  };
}

// Runtime agent state — derived from gateway + file watchers
export type AgentStatus = "idle" | "working" | "thinking" | "error" | "offline";

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask?: string;
  model?: string;
  sessionId?: string;
  lastActivity?: string; // ISO timestamp
}

// Combined agent info for the UI
export interface Agent {
  config: AgentConfig;
  state: AgentState;
  color: string;  // generated or configured
  emoji: string;  // from openclaw.json or default
}

// Session data — from openclaw sessions CLI
export interface Session {
  id: string;
  agentId: string;
  label?: string;
  startedAt: string;
  lastActivity: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  cost: number;
}

// Cron job — from openclaw cron list CLI
export interface CronJob {
  id: string;
  name: string;
  schedule: string;     // cron expression
  enabled: boolean;
  lastRun?: string;     // ISO timestamp
  nextRun?: string;     // ISO timestamp
  lastStatus?: "success" | "error";
}

export interface CronRun {
  id: string;
  jobId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "error";
  output?: string;
}

// WebSocket message types
export type WSMessageType =
  | "agent:status"
  | "agent:activity"
  | "session:update"
  | "cron:run"
  | "connected";

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
  timestamp: string;
}

// Config file shape
export interface TenshuConfig {
  openclawDir: string;
  port: number;
  clientPort: number;
  theme: "dark" | "light" | "system";
  accentColor: string;
}
