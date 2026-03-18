import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs')
  return { ...actual, existsSync: vi.fn() }
})

const mockedExistsSync = vi.mocked(existsSync)

describe('validateDirectories', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.OPENCLAW_DIR
    delete process.env.TEAM_DIR
    delete process.env.RESULTS_TSV
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  async function loadValidate() {
    const mod = await import('../startup.js')
    return mod.validateDirectories
  }

  it('returns warnings for all missing directories', async () => {
    mockedExistsSync.mockReturnValue(false)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const validateDirectories = await loadValidate()
    const warnings = validateDirectories()

    expect(warnings).toHaveLength(5)
    expect(warnings.map((w) => w.label)).toEqual([
      'OPENCLAW_DIR',
      'TEAM_DIR',
      'TEAM_DIR/knowledge',
      'TEAM_DIR/knowledge/artifacts',
      'RESULTS_TSV parent dir',
    ])
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('returns no warnings when all directories exist', async () => {
    mockedExistsSync.mockReturnValue(true)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const validateDirectories = await loadValidate()
    const warnings = validateDirectories()

    expect(warnings).toHaveLength(0)
    // Should not print the summary warning
    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('never throws even if existsSync throws', async () => {
    // existsSync itself should not throw, but we verify our function is safe
    mockedExistsSync.mockImplementation(() => {
      throw new Error('unexpected fs error')
    })

    const validateDirectories = await loadValidate()
    // Should not throw — wrap test to verify
    expect(() => validateDirectories()).not.toThrow()
  })

  it('uses custom paths from env vars', async () => {
    process.env.OPENCLAW_DIR = '/custom/openclaw'
    process.env.TEAM_DIR = '/custom/team'
    process.env.RESULTS_TSV = '/custom/data/results.tsv'

    mockedExistsSync.mockReturnValue(false)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const validateDirectories = await loadValidate()
    const warnings = validateDirectories()

    const paths = warnings.map((w) => w.path)
    expect(paths).toContain('/custom/openclaw')
    expect(paths).toContain('/custom/team')
    expect(paths).toContain(join('/custom/team', 'knowledge'))
    expect(paths).toContain(join('/custom/team', 'knowledge', 'artifacts'))
    expect(paths).toContain(dirname('/custom/data/results.tsv'))

    warnSpy.mockRestore()
  })

  it('resolves tilde in OPENCLAW_DIR', async () => {
    process.env.OPENCLAW_DIR = '~/.my-openclaw'
    mockedExistsSync.mockReturnValue(false)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const validateDirectories = await loadValidate()
    const warnings = validateDirectories()

    const openclawWarning = warnings.find((w) => w.label === 'OPENCLAW_DIR')
    expect(openclawWarning).toBeDefined()
    expect(openclawWarning!.path).toBe(join(homedir(), '.my-openclaw'))
    expect(openclawWarning!.path).not.toContain('~')

    warnSpy.mockRestore()
  })
})
