import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const TEAM_DIR = process.env.TEAM_DIR || `${process.env.HOME}/clawd/team`;
const RESULTS_TSV = process.env.RESULTS_TSV || `${process.env.HOME}/clawd/team/knowledge/results.tsv`;
const ORCHESTRATOR_LOG = "/tmp/orchestrator-output.log";

export interface Notification {
  id: string;
  level: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  source: string;
}

// In-memory notification store (resets on server restart)
const notifications: Notification[] = [];
let lastCheckedLine = 0;
let lastResultsCount = 0;

function addNotification(level: Notification["level"], title: string, message: string, source: string) {
  const n: Notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    level,
    title,
    message,
    timestamp: new Date().toISOString(),
    source,
  };
  notifications.unshift(n);
  // Keep max 100
  if (notifications.length > 100) notifications.pop();
}

// Scan for new events periodically
async function scanForEvents() {
  try {
    // Check results.tsv for new entries
    if (existsSync(RESULTS_TSV)) {
      const raw = await readFile(RESULTS_TSV, "utf-8");
      const lines = raw.trim().split("\n").slice(1); // skip header
      if (lines.length > lastResultsCount) {
        // Process new results
        for (const line of lines.slice(lastResultsCount)) {
          const [timestamp, cycle, task, agent, scoreStr, status, description] = line.split("\t");
          const score = Number(scoreStr);
          if (score >= 9) {
            addNotification("success", "High Score!", `Cycle #${cycle}: ${score}/10 on ${task}`, "results");
          } else if (status === "crash") {
            addNotification("error", "Agent Crash", `Cycle #${cycle}: ${agent} crashed on ${task}`, "results");
          } else if (score > 0 && score < 4) {
            addNotification("warning", "Low Score", `Cycle #${cycle}: ${score}/10 on ${task}`, "results");
          }
        }
        lastResultsCount = lines.length;
      }
    }

    // Check orchestrator log for errors
    if (existsSync(ORCHESTRATOR_LOG)) {
      const raw = await readFile(ORCHESTRATOR_LOG, "utf-8");
      const lines = raw.split("\n");
      if (lines.length > lastCheckedLine) {
        for (const line of lines.slice(lastCheckedLine)) {
          if (line.includes("timed out")) {
            addNotification("warning", "Agent Timeout", line.trim().slice(0, 200), "orchestrator");
          } else if (line.includes("ERROR") || line.includes("Traceback")) {
            addNotification("error", "Orchestrator Error", line.trim().slice(0, 200), "orchestrator");
          } else if (line.includes("CYCLE COMPLETE") && line.includes("score")) {
            // Already handled by results.tsv
          }
        }
        lastCheckedLine = lines.length;
      }
    }
  } catch {
    // Silent — don't crash the scanner
  }
}

// Run scanner every 15 seconds
setInterval(scanForEvents, 15000);
// Initial scan
scanForEvents();

const notificationRoutes = new Hono();

notificationRoutes.get("/", (c) => {
  const limit = Number(c.req.query("limit") || "50");
  const since = c.req.query("since") || "";

  let filtered = notifications;
  if (since) {
    const sinceTime = new Date(since).getTime();
    filtered = notifications.filter((n) => new Date(n.timestamp).getTime() > sinceTime);
  }

  return c.json({
    notifications: filtered.slice(0, limit),
    total: filtered.length,
  });
});

notificationRoutes.delete("/:id", (c) => {
  const id = c.req.param("id");
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx >= 0) notifications.splice(idx, 1);
  return c.json({ ok: true });
});

export default notificationRoutes;
