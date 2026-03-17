import { describe, it, expect } from 'vitest'
import { computePowerLevel } from '../hooks/usePowerLevel'
import type { CycleEntry } from '../hooks/useAgentHistory'

function makeEntry(overrides?: Partial<CycleEntry>): CycleEntry {
  return {
    cycle: 1,
    task: 'test-task',
    score: 5,
    status: 'keep',
    description: 'test',
    timestamp: new Date().toISOString(),
    detailedTask: 'detailed test task',
    verdict: 'pass',
    resultLength: 100,
    ...overrides,
  }
}

describe('computePowerLevel', () => {
  it('returns zero-state for empty entries', () => {
    const result = computePowerLevel([])
    expect(result.xp).toBe(0)
    expect(result.level).toBe(0)
    expect(result.levelName).toBe('Genin')
    expect(result.nextLevelXp).toBe(500)
    expect(result.progress).toBe(0)
    expect(result.powerLevel).toBe(0)
  })

  it('computes XP as sum of score * 100', () => {
    const entries = [makeEntry({ score: 3 }), makeEntry({ score: 7 })]
    const result = computePowerLevel(entries)
    expect(result.xp).toBe(1000) // (3 + 7) * 100
  })

  it('stays at Genin for low XP', () => {
    const entries = [makeEntry({ score: 2 })]
    const result = computePowerLevel(entries)
    expect(result.xp).toBe(200)
    expect(result.levelName).toBe('Genin')
    expect(result.level).toBe(0)
  })

  it('reaches Chunin at 500 XP', () => {
    const entries = [makeEntry({ score: 5 })]
    const result = computePowerLevel(entries)
    expect(result.xp).toBe(500)
    expect(result.levelName).toBe('Chunin')
    expect(result.level).toBe(1)
  })

  it('reaches Jonin at 2000 XP', () => {
    // 4 entries × score 5 = 2000 XP
    const entries = Array.from({ length: 4 }, () => makeEntry({ score: 5 }))
    const result = computePowerLevel(entries)
    expect(result.xp).toBe(2000)
    expect(result.levelName).toBe('Jonin')
  })

  it('progress reflects position within current level', () => {
    // 750 XP → Chunin (500-2000 range), progress = 250/1500 ≈ 0.167
    const entries = [makeEntry({ score: 7.5 })]
    const result = computePowerLevel(entries)
    expect(result.xp).toBe(750)
    expect(result.levelName).toBe('Chunin')
    expect(result.progress).toBeCloseTo(250 / 1500, 2)
  })

  it('computes powerLevel based on avgScore × count × keepRate', () => {
    // 2 entries, score 8 each, all 'keep' → avg=8, count=2, keepRate=1
    // powerLevel = round(8 * 2 * (0.5 + 1*0.5)) = round(16) = 16
    const entries = [makeEntry({ score: 8 }), makeEntry({ score: 8 })]
    const result = computePowerLevel(entries)
    expect(result.powerLevel).toBe(16)
  })

  it('reduces powerLevel when keepRate is low', () => {
    // 2 entries, score 8 each, 0 'keep' → keepRate=0
    // powerLevel = round(8 * 2 * (0.5 + 0*0.5)) = round(8) = 8
    const entries = [
      makeEntry({ score: 8, status: 'discard' }),
      makeEntry({ score: 8, status: 'crash' }),
    ]
    const result = computePowerLevel(entries)
    expect(result.powerLevel).toBe(8)
  })
})
