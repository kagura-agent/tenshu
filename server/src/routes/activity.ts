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

// Per-agent history — each agent shows THEIR specific work, not duplicated cycle data
activity.get("/agent-history", async (c) => {
  try {
    const limit = Number(c.req.query("limit") || "10");
    const resultsPath =
      process.env.RESULTS_TSV ||
      `${process.env.HOME}/clawd/team/knowledge/results.tsv`;

    // Read results.tsv
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

    // Scan artifacts for richer per-agent descriptions
    const artifactPreviews: Record<string, string> = {};
    if (existsSync(ARTIFACTS_DIR)) {
      const files = await readdir(ARTIFACTS_DIR);
      const mdFiles = files.filter((f) => f.endsWith(".md")).sort().reverse();
      // Read previews from last ~40 artifacts
      for (const file of mdFiles.slice(0, 40)) {
        try {
          const content = await readFile(join(ARTIFACTS_DIR, file), "utf-8");
          const lines = content.split("\n");
          // Extract first substantive line as preview
          let preview = "";
          for (const line of lines.slice(3, 20)) {
            const trimmed = line.trim();
            if (
              trimmed &&
              !trimmed.startsWith("#") &&
              !trimmed.startsWith("---") &&
              !trimmed.startsWith("Cycle:") &&
              !trimmed.startsWith("Length:") &&
              !trimmed.startsWith("{") &&
              trimmed.length > 20
            ) {
              preview = trimmed.slice(0, 200);
              break;
            }
          }
          // Key by timestamp extracted from filename
          const tsMatch = file.match(/(\d{8}-\d{6})\.md$/);
          if (tsMatch) {
            const prefix = file.startsWith("research-") ? "researcher" : "coder";
            artifactPreviews[`${prefix}-${tsMatch[1]}`] = preview;
          }
        } catch {
          // skip unreadable
        }
      }
    }

    type HistoryEntry = {
      cycle: number;
      task: string;
      score: number;
      status: string;
      description: string;
      timestamp: string;
      detailedTask: string;
      verdict: string;
      resultLength: number;
    };

    const agentMap: Record<string, HistoryEntry[]> = {
      researcher: [],
      coder: [],
      qa: [],
      planner: [],
    };

    // Group results by cycle
    const cycleMap = new Map<number, typeof results>();
    for (const r of results) {
      if (!cycleMap.has(r.cycle)) cycleMap.set(r.cycle, []);
      cycleMap.get(r.cycle)!.push(r);
    }

    // Process cycles in reverse (newest first)
    const cycles = [...cycleMap.keys()].sort((a, b) => b - a);

    for (const cycleNum of cycles) {
      const entries = cycleMap.get(cycleNum)!;
      const coderEntry = entries.filter((e) => e.agent === "coder");
      const researcherEntry = entries.find((e) => e.agent === "researcher");
      // Use the final coder entry (after retries) for the cycle score
      const finalCoder = coderEntry[coderEntry.length - 1];
      const score = finalCoder?.score ?? researcherEntry?.score ?? 0;
      const cycleStatus = finalCoder?.status ?? researcherEntry?.status ?? "";
      const ts = finalCoder?.timestamp ?? researcherEntry?.timestamp ?? "";

      // Try to find artifact preview by matching timestamp
      const tsForKey = ts.replace(/[-T:]/g, "").slice(0, 15).replace(/^(\d{8})(\d{6}).*/, "$1-$2");

      // --- Researcher: what Senku researched ---
      if (researcherEntry && agentMap.researcher.length < limit) {
        const artifactKey = `researcher-${tsForKey}`;
        agentMap.researcher.push({
          cycle: cycleNum,
          task: researcherEntry.task,
          score,
          status: cycleStatus,
          description: `Researched: ${researcherEntry.task.replace(/-/g, " ")}`,
          timestamp: ts,
          detailedTask: artifactPreviews[artifactKey] || `Research phase for ${researcherEntry.task.replace(/-/g, " ")}`,
          verdict: "",
          resultLength: 0,
        });
      }

      // --- Coder: what Bulma built (include retries) ---
      if (finalCoder && agentMap.coder.length < limit) {
        const retryCount = coderEntry.length - 1;
        const artifactKey = `coder-${tsForKey}`;
        agentMap.coder.push({
          cycle: cycleNum,
          task: finalCoder.task,
          score,
          status: cycleStatus,
          description: retryCount > 0
            ? `Built: ${finalCoder.task.replace(/-/g, " ")} (${retryCount} retry)`
            : `Built: ${finalCoder.task.replace(/-/g, " ")}`,
          timestamp: ts,
          detailedTask: artifactPreviews[artifactKey] || finalCoder.description,
          verdict: "",
          resultLength: 0,
        });
      }

      // --- QA: what Vegeta reviewed (extracted from coder descriptions) ---
      if (coderEntry.length > 0 && agentMap.qa.length < limit) {
        const qaVerdict = finalCoder?.description || "";
        const rejected = coderEntry.filter((e) => e.description.includes("rejected"));
        const approved = coderEntry.find((e) => e.description.includes("approved"));
        let qaDesc: string;
        if (rejected.length > 0 && approved) {
          qaDesc = `Rejected ${rejected.length}x, then approved: ${finalCoder.task.replace(/-/g, " ")}`;
        } else if (rejected.length > 0) {
          qaDesc = `Rejected (${rejected.length}x): ${finalCoder.task.replace(/-/g, " ")}`;
        } else if (approved) {
          qaDesc = `Approved: ${finalCoder.task.replace(/-/g, " ")}`;
        } else {
          qaDesc = `Reviewed: ${finalCoder.task.replace(/-/g, " ")}`;
        }
        agentMap.qa.push({
          cycle: cycleNum,
          task: finalCoder?.task ?? "",
          score,
          status: cycleStatus,
          description: qaDesc,
          timestamp: ts,
          detailedTask: qaVerdict,
          verdict: qaVerdict.includes("approved") ? "PASS" : qaVerdict.includes("rejected") ? "FAIL" : "",
          resultLength: 0,
        });
      }

      // --- Planner: Erwin's coordination (synthesized from cycle data) ---
      if (agentMap.planner.length < limit) {
        const agentCount = new Set(entries.map((e) => e.agent)).size;
        agentMap.planner.push({
          cycle: cycleNum,
          task: finalCoder?.task ?? researcherEntry?.task ?? "",
          score,
          status: cycleStatus,
          description: `Coordinated: ${(finalCoder?.task ?? "").replace(/-/g, " ")} (${agentCount} agents)`,
          timestamp: ts,
          detailedTask: `Cycle #${cycleNum} — ${cycleStatus === "keep" ? "kept" : "discarded"}, score ${score}`,
          verdict: "",
          resultLength: 0,
        });
      }
    }

    return c.json(agentMap);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default activity;
