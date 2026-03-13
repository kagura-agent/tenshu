import { Hono } from "hono";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const TEAM_DIR = process.env.TEAM_DIR || `${process.env.HOME}/clawd/team`;
const TEAM_LOG = join(TEAM_DIR, "knowledge", "team-log.jsonl");
const ARTIFACTS_DIR = join(TEAM_DIR, "knowledge", "artifacts");

interface LogEntry {
  timestamp: string;
  type: string;
  agent: string;
  task: string;
  result_length: number;
  score: number;
  verdict: string;
}

interface ArtifactSummary {
  name: string;
  type: "research" | "coder" | "qa";
  task: string;
  timestamp: string;
  sizeKB: number;
  preview: string;
}

const activity = new Hono();

// Recent activity from team-log.jsonl (last N entries)
activity.get("/log", async (c) => {
  try {
    const limit = Number(c.req.query("limit") || "20");
    if (!existsSync(TEAM_LOG)) return c.json([]);

    const raw = await readFile(TEAM_LOG, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const entries: LogEntry[] = lines
      .slice(-limit)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    return c.json(entries);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Recent artifacts with previews
activity.get("/artifacts", async (c) => {
  try {
    const limit = Number(c.req.query("limit") || "10");
    if (!existsSync(ARTIFACTS_DIR)) return c.json([]);

    const files = await readdir(ARTIFACTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md")).sort().reverse();

    const artifacts: ArtifactSummary[] = [];
    for (const file of mdFiles.slice(0, limit)) {
      const filePath = join(ARTIFACTS_DIR, file);
      const fileStat = await stat(filePath);
      const content = await readFile(filePath, "utf-8");

      // Parse type and task from filename: research-taskname-timestamp.md
      const match = file.match(/^(research|coder|qa)-(.+?)-(\d{8}-\d{6})\.md$/);
      const type = (match?.[1] || "unknown") as ArtifactSummary["type"];
      const task = match?.[2] || file;
      const timestamp = match?.[3]
        ? `${match[3].slice(0, 4)}-${match[3].slice(4, 6)}-${match[3].slice(6, 8)} ${match[3].slice(9, 11)}:${match[3].slice(11, 13)}:${match[3].slice(13, 15)}`
        : "";

      // Extract a meaningful preview — skip headers, get first substantive paragraph
      const lines = content.split("\n");
      let preview = "";
      for (const line of lines.slice(3)) {
        const trimmed = line.trim();
        if (
          trimmed &&
          !trimmed.startsWith("#") &&
          !trimmed.startsWith("---") &&
          !trimmed.startsWith("Cycle:") &&
          !trimmed.startsWith("Length:") &&
          trimmed.length > 30
        ) {
          preview = trimmed.slice(0, 200);
          break;
        }
      }

      artifacts.push({
        name: file,
        type,
        task,
        timestamp,
        sizeKB: Math.round(fileStat.size / 1024),
        preview,
      });
    }

    return c.json(artifacts);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Current cycle status — read orchestrator output tail
activity.get("/current", async (c) => {
  try {
    const logPath = "/tmp/orchestrator-output.log";
    if (!existsSync(logPath)) {
      return c.json({ running: false, lines: [] });
    }

    const raw = await readFile(logPath, "utf-8");
    const lines = raw.split("\n");
    const last50 = lines.slice(-50).filter(Boolean);

    // Extract current cycle info
    let currentCycle = "";
    let currentTask = "";
    let lastAgent = "";
    let lastStatus = "";

    for (const line of last50) {
      const cycleMatch = line.match(/CYCLE \d+ \(#(\d+)\) — (.+)/);
      if (cycleMatch) {
        currentCycle = cycleMatch[1];
        currentTask = cycleMatch[2];
      }
      const agentMatch = line.match(/Sending to (\w+) \((\w+)\)/);
      if (agentMatch) {
        lastAgent = agentMatch[1];
      }
      const responseMatch = line.match(/(\w+) responded \((\d+) chars\)/);
      if (responseMatch) {
        lastStatus = `${responseMatch[1]} responded (${responseMatch[2]} chars)`;
      }
      if (line.includes("timed out")) {
        lastStatus = line.trim().replace(/^.*!!/, "").trim();
      }
      if (line.includes("CYCLE COMPLETE")) {
        lastStatus = "Cycle complete";
      }
    }

    return c.json({
      running: true,
      cycle: currentCycle,
      task: currentTask,
      lastAgent,
      lastStatus,
      recentLines: last50.slice(-15),
    });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Per-agent history — combines results.tsv + team-log for a specific agent or all agents
activity.get("/agent-history", async (c) => {
  try {
    const limit = Number(c.req.query("limit") || "10");
    const resultsPath =
      process.env.RESULTS_TSV ||
      `${process.env.HOME}/clawd/team/knowledge/results.tsv`;

    // Read results.tsv for cycle history
    const results: Array<{
      timestamp: string;
      cycle: number;
      task: string;
      agent: string;
      score: number;
      status: string;
      description: string;
    }> = [];

    if (existsSync(resultsPath)) {
      const raw = await readFile(resultsPath, "utf-8");
      const lines = raw.trim().split("\n");
      for (const line of lines.slice(1)) {
        const [timestamp, cycle, task, agent, score, status, description] =
          line.split("\t");
        results.push({
          timestamp,
          cycle: Number(cycle),
          task,
          agent,
          score: Number(score),
          status,
          description: description || "",
        });
      }
    }

    // Read team-log for detailed task descriptions
    const logEntries: Array<{
      timestamp: string;
      type: string;
      agent: string;
      task: string;
      result_length: number;
      score: number;
      verdict: string;
    }> = [];

    if (existsSync(TEAM_LOG)) {
      const raw = await readFile(TEAM_LOG, "utf-8");
      const lines = raw.trim().split("\n").filter(Boolean);
      for (const line of lines.slice(-200)) {
        try {
          logEntries.push(JSON.parse(line));
        } catch {
          // skip malformed lines
        }
      }
    }

    // Group by agent — deduplicate cycles, keep coder entries (they have scores)
    const agentMap: Record<
      string,
      Array<{
        cycle: number;
        task: string;
        score: number;
        status: string;
        description: string;
        timestamp: string;
        detailedTask: string;
        verdict: string;
        resultLength: number;
      }>
    > = {};

    // Build from results.tsv (coder entries only — they have the real scores)
    const coderResults = results.filter((r) => r.agent === "coder");
    const seenCycles = new Set<number>();

    for (const r of coderResults.reverse()) {
      if (seenCycles.has(r.cycle)) continue;
      seenCycles.add(r.cycle);

      // Find matching team-log entries for this cycle's timestamp
      const cycleLog = logEntries.filter(
        (l) =>
          l.timestamp.slice(0, 16) === r.timestamp.slice(0, 16) ||
          (l.score === r.score && l.score > 0)
      );

      // Get detailed task from the research or coding log entry
      const detailedEntry =
        cycleLog.find((l) => l.type === "research") ||
        cycleLog.find((l) => l.type === "coding");

      const entry = {
        cycle: r.cycle,
        task: r.task,
        score: r.score,
        status: r.status,
        description: r.description,
        timestamp: r.timestamp,
        detailedTask: detailedEntry?.task?.slice(0, 300) || "",
        verdict:
          cycleLog.find((l) => l.type === "qa_review")?.verdict || "",
        resultLength: detailedEntry?.result_length || 0,
      };

      // Add to all relevant agents
      for (const agentRole of [
        "researcher",
        "coder",
        "qa",
        "planner",
      ]) {
        if (!agentMap[agentRole]) agentMap[agentRole] = [];
        agentMap[agentRole].push(entry);
      }
    }

    // Trim to limit per agent
    for (const key of Object.keys(agentMap)) {
      agentMap[key] = agentMap[key].slice(0, limit);
    }

    return c.json(agentMap);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default activity;
