export const STATUS_COLORS: Record<string, string> = {
  working: "#22c55e",
  thinking: "#3b82f6",
  idle: "#6b7280",
  error: "#ef4444",
  offline: "#374151",
};

// Default agent colors (assigned by index when not configured)
export const AGENT_COLORS = [
  "#ff6b35", // orange
  "#FFCC00", // yellow
  "#4CAF50", // green
  "#E91E63", // pink
  "#0077B5", // blue
  "#9C27B0", // purple
  "#00BCD4", // cyan
  "#FF5722", // deep orange
];

export const DEFAULT_PORT = 3001;
export const DEFAULT_CLIENT_PORT = 5173;
export const DEFAULT_OPENCLAW_DIR = "~/.openclaw";
