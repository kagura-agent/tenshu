import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DEFAULT_PORT, DEFAULT_OPENCLAW_DIR } from "@tenshu/shared";
import { loadConfig, watchConfig } from "./openclaw/config.js";
import agentRoutes from "./routes/agents.js";
import sessionRoutes from "./routes/sessions.js";
import cronRoutes from "./routes/cron.js";
import resultsRoutes from "./routes/results.js";
import systemRoutes from "./routes/system.js";
import { addClient, removeClient } from "./ws/handler.js";
import { startGatewayPoller, startWorkspaceWatchers } from "./ws/watchers.js";

const openclawDir = process.env.OPENCLAW_DIR || DEFAULT_OPENCLAW_DIR;
try {
  loadConfig(openclawDir);
} catch (e) {
  console.error("[tenshu] Could not load openclaw.json:", (e as Error).message);
  console.error("[tenshu] Set OPENCLAW_DIR or ensure ~/.openclaw/openclaw.json exists.");
  process.exit(1);
}
watchConfig(openclawDir, (config) => {
  console.log(`[tenshu] openclaw.json reloaded — ${config.agents.length} agents`);
});

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("/*", cors());

app.get("/api/health", (c) =>
  c.json({ status: "ok", name: "tenshu", version: "0.1.0" })
);

app.route("/api/agents", agentRoutes);
app.route("/api/sessions", sessionRoutes);
app.route("/api/cron", cronRoutes);
app.route("/api/results", resultsRoutes);
app.route("/api/system", systemRoutes);

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      addClient(ws);
    },
    onClose(_event, ws) {
      removeClient(ws);
    },
  }))
);

const port = Number(process.env.TENSHU_PORT) || DEFAULT_PORT;
console.log(`天守 Tenshu server running on http://localhost:${port}`);
const server = serve({ fetch: app.fetch, port });
injectWebSocket(server);

startGatewayPoller();
startWorkspaceWatchers();
