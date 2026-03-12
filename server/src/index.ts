import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DEFAULT_PORT, DEFAULT_OPENCLAW_DIR } from "@tenshu/shared";
import { loadConfig, watchConfig } from "./openclaw/config.js";
import agentRoutes from "./routes/agents.js";
import sessionRoutes from "./routes/sessions.js";
import cronRoutes from "./routes/cron.js";

const openclawDir = process.env.OPENCLAW_DIR || DEFAULT_OPENCLAW_DIR;
loadConfig(openclawDir);
watchConfig(openclawDir, (config) => {
  console.log(`[tenshu] openclaw.json reloaded — ${config.agents.length} agents`);
});

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) =>
  c.json({ status: "ok", name: "tenshu", version: "0.1.0" })
);

app.route("/api/agents", agentRoutes);
app.route("/api/sessions", sessionRoutes);
app.route("/api/cron", cronRoutes);

const port = Number(process.env.TENSHU_PORT) || DEFAULT_PORT;
console.log(`天守 Tenshu server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
