import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
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
import activityRoutes from "./routes/activity.js";
import avatarRoutes from "./routes/avatars.js";
import knowledgeRoutes from "./routes/knowledge.js";
import interactionRoutes from "./routes/interactions.js";
import notificationRoutes from "./routes/notifications.js";
import { addClient, removeClient } from "./ws/handler.js";
import { startGatewayPoller, startWorkspaceWatchers } from "./ws/watchers.js";

const openclawDir = process.env.OPENCLAW_DIR || DEFAULT_OPENCLAW_DIR;
let demoMode = false;
try {
  loadConfig(openclawDir);
  watchConfig(openclawDir, (config) => {
    console.log(`[tenshu] openclaw.json reloaded — ${config.agents.length} agents`);
  });
} catch (e) {
  console.warn("[tenshu] Could not load openclaw.json:", (e as Error).message);
  console.warn("[tenshu] Starting in demo mode — client will use simulated data.");
  demoMode = true;
}

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("/*", cors());

app.get("/api/health", (c) =>
  c.json({ status: "ok", name: "tenshu", version: "0.1.0", demo: demoMode })
);

app.route("/api/agents", agentRoutes);
app.route("/api/sessions", sessionRoutes);
app.route("/api/cron", cronRoutes);
app.route("/api/results", resultsRoutes);
app.route("/api/system", systemRoutes);
app.route("/api/activity", activityRoutes);
app.route("/api/avatars", avatarRoutes);
app.route("/api/knowledge", knowledgeRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/interactions", interactionRoutes);

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

// Serve built client files in production / Docker
app.use("/*", serveStatic({ root: "../client/dist" }));
// SPA fallback — serve index.html for non-API routes
app.get("*", serveStatic({ root: "../client/dist", path: "index.html" }));

const port = Number(process.env.TENSHU_PORT) || DEFAULT_PORT;
const modeLabel = demoMode ? " (demo mode)" : "";
console.log(`天守 Tenshu server running on http://localhost:${port}${modeLabel}`);
const server = serve({ fetch: app.fetch, port });
injectWebSocket(server);

if (!demoMode) {
  startGatewayPoller();
  startWorkspaceWatchers();
}
