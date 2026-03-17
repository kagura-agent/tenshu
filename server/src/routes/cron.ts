import { Hono } from 'hono'
import {
  listCronJobs,
  toggleCronJob,
  runCronJob,
  getCronRuns,
} from '../openclaw/cli.js'

function validateId(id: string): boolean {
  return /^[\w-]{1,64}$/.test(id)
}

const cron = new Hono()

cron.get('/', async (c) => {
  try {
    const jobs = await listCronJobs()
    return c.json(jobs)
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

cron.put('/:id', async (c) => {
  const { id } = c.req.param()
  if (!validateId(id)) {
    return c.json({ error: 'Invalid job id' }, 400)
  }
  const body = await c.req.json<{ enabled?: unknown }>()
  if (typeof body.enabled !== 'boolean') {
    return c.json({ error: 'enabled must be a boolean' }, 400)
  }
  const { enabled } = body as { enabled: boolean }
  try {
    await toggleCronJob(id, enabled)
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

cron.post('/:id/run', async (c) => {
  const { id } = c.req.param()
  if (!validateId(id)) {
    return c.json({ error: 'Invalid job id' }, 400)
  }
  try {
    await runCronJob(id)
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

cron.get('/:id/runs', async (c) => {
  const { id } = c.req.param()
  if (!validateId(id)) {
    return c.json({ error: 'Invalid job id' }, 400)
  }
  try {
    const runs = await getCronRuns(id)
    return c.json(runs)
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

export default cron
