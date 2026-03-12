import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DEFAULT_PORT } from "@tenshu/shared";

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) => {
  return c.json({ status: "ok", name: "tenshu", version: "0.1.0" });
});

const port = Number(process.env.TENSHU_PORT) || DEFAULT_PORT;

console.log(`天守 Tenshu server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
