import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../openclaw/cli.js', () => ({
  listCronJobs: vi.fn(),
  toggleCronJob: vi.fn(),
  runCronJob: vi.fn(),
  getCronRuns: vi.fn(),
}))

import {
  listCronJobs,
  toggleCronJob,
  runCronJob,
  getCronRuns,
} from '../openclaw/cli.js'
import type { CronJob, CronRun } from '@tenshu/shared'

const mockedListCronJobs = vi.mocked(listCronJobs)
const mockedToggleCronJob = vi.mocked(toggleCronJob)
const mockedRunCronJob = vi.mocked(runCronJob)
const mockedGetCronRuns = vi.mocked(getCronRuns)

describe('cron route', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()

    const mod = await import('../routes/cron.js')
    app = new Hono()
    app.route('/cron', mod.default)
  })

  describe('GET /', () => {
    it('returns list of cron jobs', async () => {
      const jobs: CronJob[] = [
        {
          id: 'heartbeat',
          name: 'Heartbeat',
          schedule: '*/30 * * * *',
          enabled: true,
          lastRun: '2026-03-19T04:00:00.000Z',
          nextRun: '2026-03-19T04:30:00.000Z',
          lastStatus: 'success',
        },
      ]
      mockedListCronJobs.mockResolvedValue(jobs)

      const res = await app.request('/cron')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual(jobs)
    })

    it('returns 500 when listCronJobs fails', async () => {
      mockedListCronJobs.mockRejectedValue(new Error('CLI not found'))

      const res = await app.request('/cron')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe('CLI not found')
    })
  })

  describe('PUT /:id', () => {
    it('toggles a cron job on', async () => {
      mockedToggleCronJob.mockResolvedValue(undefined)

      const res = await app.request('/cron/heartbeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ ok: true })
      expect(mockedToggleCronJob).toHaveBeenCalledWith('heartbeat', true)
    })

    it('toggles a cron job off', async () => {
      mockedToggleCronJob.mockResolvedValue(undefined)

      const res = await app.request('/cron/heartbeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      })

      expect(res.status).toBe(200)
      expect(mockedToggleCronJob).toHaveBeenCalledWith('heartbeat', false)
    })

    it('returns 400 when enabled is not a boolean', async () => {
      const res = await app.request('/cron/heartbeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: 'yes' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('enabled must be a boolean')
    })

    it('returns 400 when enabled is missing', async () => {
      const res = await app.request('/cron/heartbeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('enabled must be a boolean')
    })

    it('returns 400 for invalid job id', async () => {
      const res = await app.request('/cron/invalid%20id!@#', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Invalid job id')
    })

    it('returns 500 when toggleCronJob fails', async () => {
      mockedToggleCronJob.mockRejectedValue(new Error('Job not found'))

      const res = await app.request('/cron/heartbeat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('Job not found')
    })
  })

  describe('POST /:id/run', () => {
    it('runs a cron job', async () => {
      mockedRunCronJob.mockResolvedValue(undefined)

      const res = await app.request('/cron/heartbeat/run', {
        method: 'POST',
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({ ok: true })
      expect(mockedRunCronJob).toHaveBeenCalledWith('heartbeat')
    })

    it('returns 400 for invalid job id', async () => {
      const res = await app.request('/cron/bad%20id!/run', {
        method: 'POST',
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Invalid job id')
    })

    it('returns 500 when runCronJob fails', async () => {
      mockedRunCronJob.mockRejectedValue(new Error('Execution failed'))

      const res = await app.request('/cron/heartbeat/run', {
        method: 'POST',
      })

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('Execution failed')
    })
  })

  describe('GET /:id/runs', () => {
    it('returns run history for a job', async () => {
      const runs: CronRun[] = [
        {
          id: 'run-1',
          jobId: 'heartbeat',
          startedAt: '2026-03-19T04:00:00.000Z',
          finishedAt: '2026-03-19T04:00:05.000Z',
          status: 'success',
          output: 'HEARTBEAT_OK',
        },
      ]
      mockedGetCronRuns.mockResolvedValue(runs)

      const res = await app.request('/cron/heartbeat/runs')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual(runs)
      expect(mockedGetCronRuns).toHaveBeenCalledWith('heartbeat')
    })

    it('returns 400 for invalid job id', async () => {
      const res = await app.request('/cron/bad id!/runs')
      expect(res.status).toBe(400)

      const body = await res.json()
      expect(body.error).toBe('Invalid job id')
    })

    it('returns 500 when getCronRuns fails', async () => {
      mockedGetCronRuns.mockRejectedValue(new Error('No such job'))

      const res = await app.request('/cron/heartbeat/runs')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe('No such job')
    })
  })

  describe('validateId', () => {
    it('accepts valid ids with alphanumeric, underscores, and hyphens', async () => {
      mockedToggleCronJob.mockResolvedValue(undefined)

      const res = await app.request('/cron/my_job-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(200)
    })

    it('rejects ids longer than 64 characters', async () => {
      const longId = 'a'.repeat(65)
      const res = await app.request(`/cron/${longId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Invalid job id')
    })

    it('accepts ids exactly 64 characters long', async () => {
      mockedToggleCronJob.mockResolvedValue(undefined)

      const validId = 'a'.repeat(64)
      const res = await app.request(`/cron/${validId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      })

      expect(res.status).toBe(200)
    })
  })
})
