import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// We need to mock fs/promises and os for the avatars route
const TEST_DIR = join(tmpdir(), 'tenshu-test-avatars')
const CONFIG_DIR = join(TEST_DIR, 'config')
const CONFIG_FILE = join(CONFIG_DIR, 'avatars.json')
const CHARACTERS_DIR = join(TEST_DIR, 'characters')

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises',
  )
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
  }
})

vi.mock('node:os', async () => {
  const actual = await vi.importActual<typeof import('node:os')>('node:os')
  return {
    ...actual,
    homedir: vi.fn(() => TEST_DIR),
  }
})

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'

const mockedReadFile = vi.mocked(readFile)
const mockedWriteFile = vi.mocked(writeFile)
const mockedMkdir = vi.mocked(mkdir)
const mockedReaddir = vi.mocked(readdir)

describe('avatars route', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()
    mockedMkdir.mockResolvedValue(undefined)
    mockedWriteFile.mockResolvedValue(undefined)

    const mod = await import('../routes/avatars.js')
    app = new Hono()
    app.route('/avatars', mod.default)
  })

  describe('GET /', () => {
    it('returns avatar config from file', async () => {
      mockedReadFile.mockResolvedValue(
        JSON.stringify({ 'agent-1': '/assets/characters/goku.png' }),
      )

      const res = await app.request('/avatars')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual({ 'agent-1': '/assets/characters/goku.png' })
    })

    it('returns empty object when config file does not exist', async () => {
      mockedReadFile.mockRejectedValue(new Error('ENOENT'))

      const res = await app.request('/avatars')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual({})
    })
  })

  describe('GET /available', () => {
    it('returns list of character images', async () => {
      // First call: main characters dir
      // Second call: custom dir
      mockedReaddir
        .mockResolvedValueOnce([
          'goku.png',
          'vegeta.jpg',
          'readme.txt',
          'bulma.webp',
        ] as any)
        .mockResolvedValueOnce(['custom1.png'] as any)

      const res = await app.request('/avatars/available')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toContain('/assets/characters/goku.png')
      expect(body).toContain('/assets/characters/vegeta.jpg')
      expect(body).toContain('/assets/characters/bulma.webp')
      expect(body).toContain('/assets/characters/custom/custom1.png')
      // txt file should be filtered out
      expect(body).not.toContain('/assets/characters/readme.txt')
    })

    it('returns images without custom dir if it does not exist', async () => {
      mockedReaddir
        .mockResolvedValueOnce(['goku.png'] as any)
        .mockRejectedValueOnce(new Error('ENOENT'))

      const res = await app.request('/avatars/available')
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body).toEqual(['/assets/characters/goku.png'])
    })

    it('returns 500 when main characters dir fails', async () => {
      mockedReaddir.mockRejectedValueOnce(new Error('Permission denied'))

      const res = await app.request('/avatars/available')
      expect(res.status).toBe(500)

      const body = await res.json()
      expect(body.error).toBe('Permission denied')
    })
  })

  describe('PUT /:agentId', () => {
    it('sets avatar for an agent', async () => {
      mockedReadFile.mockResolvedValue(JSON.stringify({}))

      const res = await app.request('/avatars/agent-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '/assets/characters/goku.png' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        ok: true,
        agentId: 'agent-1',
        image: '/assets/characters/goku.png',
      })

      // Should have saved the config
      expect(mockedMkdir).toHaveBeenCalled()
      expect(mockedWriteFile).toHaveBeenCalled()
    })

    it('returns 400 when image is missing', async () => {
      const res = await app.request('/avatars/agent-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('image is required')
    })

    it('merges with existing config', async () => {
      mockedReadFile.mockResolvedValue(
        JSON.stringify({ 'agent-1': '/assets/characters/old.png' }),
      )

      const res = await app.request('/avatars/agent-2', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '/assets/characters/new.png' }),
      })

      expect(res.status).toBe(200)

      // Verify the saved config includes both agents
      const savedData = JSON.parse(
        (mockedWriteFile as any).mock.calls[0][1] as string,
      )
      expect(savedData['agent-1']).toBe('/assets/characters/old.png')
      expect(savedData['agent-2']).toBe('/assets/characters/new.png')
    })
  })

  describe('POST /:agentId/upload', () => {
    it('returns 400 when no file is provided', async () => {
      const formData = new FormData()
      const res = await app.request('/avatars/agent-1/upload', {
        method: 'POST',
        body: formData,
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('file is required')
    })

    it('returns 400 when file is a string', async () => {
      const formData = new FormData()
      formData.append('file', 'just-a-string')

      const res = await app.request('/avatars/agent-1/upload', {
        method: 'POST',
        body: formData,
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('file is required')
    })

    it('uploads a file and updates config', async () => {
      mockedReadFile.mockResolvedValue(JSON.stringify({}))

      const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], {
        type: 'image/png',
      })
      const file = new File([blob], 'avatar.png', { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', file)

      const res = await app.request('/avatars/agent-1/upload', {
        method: 'POST',
        body: formData,
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.ok).toBe(true)
      expect(body.agentId).toBe('agent-1')
      expect(body.image).toMatch(/^\/assets\/characters\/custom\/agent-1_\d+\.png$/)

      // Should have created custom dir and written the file
      expect(mockedMkdir).toHaveBeenCalled()
      expect(mockedWriteFile).toHaveBeenCalled()
    })
  })
})
