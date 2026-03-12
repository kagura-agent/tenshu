import { Hono } from "hono";
import { listCronJobs, toggleCronJob, runCronJob, getCronRuns } from "../openclaw/cli.js";

const cron = new Hono();

cron.get("/", async (c) => {
  try {
    const jobs = await listCronJobs();
    return c.json(jobs);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

cron.put("/:id", async (c) => {
  const { id } = c.req.param();
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  try {
    await toggleCronJob(id, enabled);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

cron.post("/:id/run", async (c) => {
  const { id } = c.req.param();
  try {
    await runCronJob(id);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

cron.get("/:id/runs", async (c) => {
  const { id } = c.req.param();
  try {
    const runs = await getCronRuns(id);
    return c.json(runs);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

export default cron;
