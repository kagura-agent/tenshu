import { Hono } from "hono";
import { listSessions } from "../openclaw/cli.js";

const sessions = new Hono();

sessions.get("/", async (c) => {
  try {
    const data = await listSessions();
    return c.json(data);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default sessions;
