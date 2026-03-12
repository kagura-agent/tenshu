import { Hono } from "hono";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import type { SystemResources } from "@tenshu/shared";

// Using execFile (NOT exec) — safe from shell injection by design
const execFileAsync = promisify(execFile);

async function getGpuInfo(): Promise<SystemResources["gpu"]> {
  try {
    const { stdout } = await execFileAsync("nvidia-smi", [
      "--query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw,power.limit",
      "--format=csv,noheader,nounits",
    ], { timeout: 5000 });
    const [name, temp, util, memUsed, memTotal, power, powerCap] =
      stdout.trim().split(", ");
    return {
      name: name.trim(),
      tempC: Number(temp),
      utilPercent: Number(util),
      memUsedMB: Number(memUsed),
      memTotalMB: Number(memTotal),
      powerW: Math.round(Number(power)),
      powerCapW: Math.round(Number(powerCap)),
    };
  } catch {
    return null;
  }
}

async function getCpuInfo(): Promise<SystemResources["cpu"]> {
  try {
    const stat = await readFile("/proc/stat", "utf-8");
    const line = stat.split("\n")[0];
    const parts = line.split(/\s+/).slice(1).map(Number);
    const idle = parts[3];
    const total = parts.reduce((a, b) => a + b, 0);
    const usagePercent = Math.round(((total - idle) / total) * 100);

    const cpuinfo = await readFile("/proc/cpuinfo", "utf-8");
    const cores = (cpuinfo.match(/^processor/gm) || []).length;

    return { usagePercent, cores };
  } catch {
    return { usagePercent: 0, cores: 0 };
  }
}

async function getMemoryInfo(): Promise<SystemResources["memory"]> {
  try {
    const meminfo = await readFile("/proc/meminfo", "utf-8");
    const total = Number(meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || 0) / 1024;
    const available =
      Number(meminfo.match(/MemAvailable:\s+(\d+)/)?.[1] || 0) / 1024;
    return {
      usedMB: Math.round(total - available),
      totalMB: Math.round(total),
    };
  } catch {
    return { usedMB: 0, totalMB: 0 };
  }
}

async function getDiskInfo(): Promise<SystemResources["disk"]> {
  try {
    const { stdout } = await execFileAsync("df", ["-BG", "--output=used,size", "/"], {
      timeout: 5000,
    });
    const line = stdout.trim().split("\n")[1];
    const [used, total] = line.trim().split(/\s+/).map((s) => Number(s.replace("G", "")));
    return { usedGB: used, totalGB: total, path: "/" };
  } catch {
    return { usedGB: 0, totalGB: 0, path: "/" };
  }
}

async function getLoadedModels(): Promise<SystemResources["loadedModels"]> {
  try {
    const { stdout } = await execFileAsync("ollama", ["ps"], { timeout: 5000 });
    const lines = stdout.trim().split("\n").slice(1);
    return lines
      .filter((l) => l.trim())
      .map((line) => {
        const parts = line.split(/\s+/);
        const name = parts[0];
        const sizeStr = parts[2] || "0";
        const sizeGB = sizeStr.includes("GB")
          ? Number(sizeStr.replace("GB", ""))
          : Number(sizeStr.replace("MB", "")) / 1024;
        return { name, sizeGB: Math.round(sizeGB * 10) / 10 };
      });
  } catch {
    return [];
  }
}

async function getUptime(): Promise<string> {
  try {
    const raw = await readFile("/proc/uptime", "utf-8");
    const seconds = Math.floor(Number(raw.split(" ")[0]));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m`;
  } catch {
    return "unknown";
  }
}

const system = new Hono();

system.get("/", async (c) => {
  try {
    const [gpu, cpu, memory, disk, loadedModels, uptime] = await Promise.all([
      getGpuInfo(),
      getCpuInfo(),
      getMemoryInfo(),
      getDiskInfo(),
      getLoadedModels(),
      getUptime(),
    ]);

    const resources: SystemResources = {
      gpu,
      cpu,
      memory,
      disk,
      loadedModels,
      uptime,
    };

    return c.json(resources);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default system;
