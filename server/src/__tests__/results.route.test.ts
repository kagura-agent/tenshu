import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises',
  )
  return {
    ...actual,
    readFile: vi.fn(),
  }
})

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return {
    ...actual,
    existsSync: vi.fn(),
  }
})

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const mockedReadFile = vi.mocked(readFile)
const mockedExistsSync = vi.mocked(existsSync)

describe('results route', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()

    const mod = await import('../routes/results.js')
    app = new Hono()
    app.route('/results', mod.default)
  })

  describe('GET /', () => {
    it('returns parsed TSV rows', async () => {
      mockedExistsSync.mockReturnValue(true)
      const tsv = [
        'timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription',
        '2026-03-12T14:00:00.000Z\t1\tcode-review\tSenku\t7.8\tkeep\tReviewed auth',
        '2026-03-12T15:00:00.000Z\t2\trefactor\tBulma\t8.5\tkeep\tRefactored db',
      ].join('\n')
      mockedReadFile.mockResolvedValue(tsv)

      const res = await app.request('/results')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toHaveLength(2)

      expect(body[0].timestamp).toBe('2026-03-12T14:00:00.000Z')
      expect(body[0].cycle).toBe(1)
      expect(body[0].task).toBe('code-review')
      expect(body[0].agent).toBe('Senku')
      expect(body[0].score).toBe(7.8)
      expect(body[0].status).toBe('keep')
      expect(body[0].description).toBe('Reviewed auth')

      expect(body[1].agent).toBe('Bulma')
      expect(body[1].score).toBe(8.5)
    })

    it('returns empty array when TSV file does not exist', async () => {
      mockedExistsSync.mockReturnValue(false)

      const res = await app.request('/results')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual([])
    })

    it('returns empty array when TSV has only header', async () => {
      mockedExistsSync.mockReturnValue(true)
      mockedReadFile.mockResolvedValue(
        'timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription',
      )

      const res = await app.request('/results')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual([])
    })

    it('handles missing description field', async () => {
      mockedExistsSync.mockReturnValue(true)
      const tsv = [
        'timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription',
        '2026-03-12T14:00:00.000Z\t1\ttask-a\tagent-1\t5.0\tdiscard\t',
      ].join('\n')
      mockedReadFile.mockResolvedValue(tsv)

      const res = await app.request('/results')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body[0].description).toBe('')
    })

    it('returns 500 when readFile throws', async () => {
      mockedExistsSync.mockReturnValue(true)
      mockedReadFile.mockRejectedValue(new Error('Permission denied'))

      const res = await app.request('/results')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe('Permission denied')
    })

    it('handles all result status types', async () => {
      mockedExistsSync.mockReturnValue(true)
      const tsv = [
        'timestamp\tcycle\ttask\tagent\tscore\tstatus\tdescription',
        '2026-03-12T14:00:00.000Z\t1\ta\tX\t1\tkeep\t',
        '2026-03-12T14:00:00.000Z\t2\tb\tY\t2\tdiscard\t',
        '2026-03-12T14:00:00.000Z\t3\tc\tZ\t3\tcrash\t',
        '2026-03-12T14:00:00.000Z\t4\td\tW\t4\tskip\t',
      ].join('\n')
      mockedReadFile.mockResolvedValue(tsv)

      const res = await app.request('/results')
      const body = await res.json()

      expect(body).toHaveLength(4)
      expect(body.map((r: any) => r.status)).toEqual([
        'keep',
        'discard',
        'crash',
        'skip',
      ])
    })
  })
})
