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

/** ISO 8601 timestamp string, e.g. "2026-03-12T14:00:00.000Z" */
export type ISOTimestamp = string;

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTask?: string;
  model?: string;
  sessionId?: string;
  lastActivity?: ISOTimestamp;
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
  startedAt: ISOTimestamp;
  lastActivity: ISOTimestamp;
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
  lastRun?: ISOTimestamp;
  nextRun?: ISOTimestamp;
  lastStatus?: "success" | "error";
}

export interface CronRun {
  id: string;
  jobId: string;
  startedAt: ISOTimestamp;
  finishedAt?: ISOTimestamp;
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

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: string;
}

// Results.tsv row — cycle experiment log (Karpathy autoresearch pattern)
export interface ResultRow {
  timestamp: ISOTimestamp;
  cycle: number;
  task: string;
  agent: string;
  score: number;
  status: "keep" | "discard" | "crash" | "skip";
  description: string;
}

// System resource metrics
export interface SystemResources {
  gpu: {
    name: string;
    tempC: number;
    utilPercent: number;
    memUsedMB: number;
    memTotalMB: number;
    powerW: number;
    powerCapW: number;
  } | null;
  cpu: {
    usagePercent: number;
    cores: number;
  };
  memory: {
    usedMB: number;
    totalMB: number;
  };
  disk: {
    usedGB: number;
    totalGB: number;
    path: string;
  };
  loadedModels: Array<{
    name: string;
    sizeGB: number;
  }>;
  uptime: string;
}

// Config file shape
export interface TenshuConfig {
  openclawDir: string;
  port: number;
  clientPort: number;
  theme: "dark" | "light" | "system";
  accentColor: string;
}
