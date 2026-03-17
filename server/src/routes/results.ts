import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { ResultRow } from '@tenshu/shared'

const RESULTS_TSV =
  process.env.RESULTS_TSV ||
  `${process.env.HOME}/clawd/team/knowledge/results.tsv`

const results = new Hono()

results.get('/', async (c) => {
  try {
    if (!existsSync(RESULTS_TSV)) {
      return c.json([])
    }
    const raw = await readFile(RESULTS_TSV, 'utf-8')
    const lines = raw.trim().split('\n')
    if (lines.length < 2) return c.json([])

    const rows: ResultRow[] = lines.slice(1).map((line) => {
      const [timestamp, cycle, task, agent, score, status, description] =
        line.split('\t')
      return {
        timestamp,
        cycle: Number(cycle),
        task,
        agent,
        score: Number(score),
        status: status as ResultRow['status'],
        description: description || '',
      }
    })

    return c.json(rows)
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500)
  }
})

export default results
