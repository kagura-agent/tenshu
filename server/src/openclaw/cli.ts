import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Session, CronJob, CronRun } from "@tenshu/shared";

const execFileAsync = promisify(execFile);

async function run(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("openclaw", args, { timeout: 15000 });
    return stdout.trim();
  } catch (e) {
    const err = e as Error & { stderr?: string };
    throw new Error(`openclaw ${args.join(" ")} failed: ${err.stderr || err.message}`);
  }
}

function parseJSON<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("[") !== -1 ? trimmed.indexOf("[") : trimmed.indexOf("{");
  if (start === -1) return [] as unknown as T;
  return JSON.parse(trimmed.slice(start));
}

export async function listSessions(): Promise<Session[]> {
  const raw = await run(["sessions", "--all-agents", "--json"]);
  return parseJSON<Session[]>(raw);
}

export async function listCronJobs(): Promise<CronJob[]> {
  const raw = await run(["cron", "list", "--json", "--all"]);
  return parseJSON<CronJob[]>(raw);
}

export async function toggleCronJob(id: string, enabled: boolean): Promise<void> {
  await run(["cron", enabled ? "enable" : "disable", id]);
}

export async function runCronJob(id: string): Promise<void> {
  await run(["cron", "run", id, "--force"]);
}

export async function getCronRuns(id: string): Promise<CronRun[]> {
  const raw = await run(["cron", "runs", id, "--json"]);
  return parseJSON<CronRun[]>(raw);
}
