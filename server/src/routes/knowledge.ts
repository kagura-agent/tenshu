import { Hono } from "hono";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const TEAM_DIR = process.env.TEAM_DIR || `${process.env.HOME}/clawd/team`;
const ARTIFACTS_DIR = join(TEAM_DIR, "knowledge", "artifacts");
const KNOWLEDGE_DIR = join(TEAM_DIR, "knowledge");

export interface KnowledgeArtifact {
  name: string;
  path: string;
  type: "research" | "coder" | "qa" | "misc";
  task: string;
  agent: string;
  timestamp: string;
  sizeKB: number;
  preview: string;
}

const knowledge = new Hono();

function parseFilename(file: string): { type: KnowledgeArtifact["type"]; task: string; timestamp: string; agent: string } {
  const match = file.match(/^(research|coder|qa)-(.+?)-(\d{8}-\d{6})\.md$/);
  if (match) {
    const type = match[1] as KnowledgeArtifact["type"];
    const agentMap: Record<string, string> = { research: "Senku", coder: "Bulma", qa: "Vegeta" };
    return {
      type,
      task: match[2],
      agent: agentMap[type] || type,
      timestamp: `${match[3].slice(0, 4)}-${match[3].slice(4, 6)}-${match[3].slice(6, 8)} ${match[3].slice(9, 11)}:${match[3].slice(11, 13)}:${match[3].slice(13, 15)}`,
    };
  }
  return { type: "misc", task: file.replace(/\.md$/, ""), timestamp: "", agent: "unknown" };
}

function extractPreview(content: string): string {
  const lines = content.split("\n");
  for (const line of lines.slice(3, 30)) {
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
      return trimmed.slice(0, 300);
    }
  }
  return "";
}

// List/search knowledge artifacts
knowledge.get("/", async (c) => {
  try {
    const limit = Number(c.req.query("limit") || "50");
    const search = (c.req.query("search") || "").toLowerCase();
    const agentFilter = c.req.query("agent") || "";
    const typeFilter = c.req.query("type") || "";

    if (!existsSync(ARTIFACTS_DIR)) return c.json({ artifacts: [], total: 0 });

    const files = await readdir(ARTIFACTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md")).sort().reverse();

    const artifacts: KnowledgeArtifact[] = [];
    let total = 0;

    for (const file of mdFiles) {
      const parsed = parseFilename(file);

      // Apply filters
      if (agentFilter && parsed.type !== agentFilter && parsed.agent.toLowerCase() !== agentFilter.toLowerCase()) continue;
      if (typeFilter && parsed.type !== typeFilter) continue;

      const filePath = join(ARTIFACTS_DIR, file);

      if (search) {
        // Check filename match first
        const nameMatch = file.toLowerCase().includes(search) || parsed.task.toLowerCase().includes(search);
        if (!nameMatch) {
          // Check content
          const content = await readFile(filePath, "utf-8");
          if (!content.toLowerCase().includes(search)) continue;
        }
      }

      total++;
      if (artifacts.length >= limit) continue; // count total but stop adding

      const fileStat = await stat(filePath);
      const content = await readFile(filePath, "utf-8");

      artifacts.push({
        name: file,
        path: filePath,
        type: parsed.type,
        task: parsed.task,
        agent: parsed.agent,
        timestamp: parsed.timestamp,
        sizeKB: Math.round(fileStat.size / 1024),
        preview: extractPreview(content),
      });
    }

    return c.json({ artifacts, total });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Get full content of a single artifact
knowledge.get("/artifact/:name", async (c) => {
  try {
    const name = c.req.param("name");
    // Prevent path traversal
    if (name.includes("..") || name.includes("/")) {
      return c.json({ error: "Invalid filename" }, 400);
    }

    const filePath = join(ARTIFACTS_DIR, name);
    if (!existsSync(filePath)) {
      return c.json({ error: "Not found" }, 404);
    }

    const content = await readFile(filePath, "utf-8");
    const fileStat = await stat(filePath);
    const parsed = parseFilename(name);

    return c.json({
      name,
      content,
      type: parsed.type,
      task: parsed.task,
      agent: parsed.agent,
      timestamp: parsed.timestamp,
      sizeKB: Math.round(fileStat.size / 1024),
    });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// Stats — aggregate counts
knowledge.get("/stats", async (c) => {
  try {
    if (!existsSync(ARTIFACTS_DIR)) return c.json({ total: 0, byType: {}, byAgent: {} });

    const files = await readdir(ARTIFACTS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    const byType: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    let totalSizeKB = 0;

    for (const file of mdFiles) {
      const parsed = parseFilename(file);
      byType[parsed.type] = (byType[parsed.type] || 0) + 1;
      byAgent[parsed.agent] = (byAgent[parsed.agent] || 0) + 1;
      const fileStat = await stat(join(ARTIFACTS_DIR, file));
      totalSizeKB += Math.round(fileStat.size / 1024);
    }

    return c.json({ total: mdFiles.length, totalSizeKB, byType, byAgent });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default knowledge;
