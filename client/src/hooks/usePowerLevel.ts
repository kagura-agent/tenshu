import { useMemo } from 'react'
import type { CycleEntry } from './useAgentHistory'

export interface PowerLevel {
  xp: number
  level: number
  levelName: string
  nextLevelXp: number
  progress: number // 0-1 within current level
  powerLevel: number // composite display number
}

const LEVELS = [
  { name: 'Genin', xp: 0 },
  { name: 'Chunin', xp: 500 },
  { name: 'Jonin', xp: 2000 },
  { name: 'Kage', xp: 5000 },
  { name: 'Hokage', xp: 10000 },
] as const

export function computePowerLevel(entries: CycleEntry[]): PowerLevel {
  if (entries.length === 0) {
    return {
      xp: 0,
      level: 0,
      levelName: 'Genin',
      nextLevelXp: 500,
      progress: 0,
      powerLevel: 0,
    }
  }

  // XP = sum of (score * 100) for each task
  const xp = Math.round(entries.reduce((sum, e) => sum + e.score * 100, 0))

  // Find current level
  let levelIdx = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      levelIdx = i
      break
    }
  }

  const currentThreshold = LEVELS[levelIdx].xp
  const nextThreshold =
    levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1].xp : LEVELS[levelIdx].xp
  const range = nextThreshold - currentThreshold
  const progress = range > 0 ? Math.min((xp - currentThreshold) / range, 1) : 1

  // Power level = composite: avg score * tasks completed * success multiplier
  const avgScore = entries.reduce((s, e) => s + e.score, 0) / entries.length
  const keepRate =
    entries.filter((e) => e.status === 'keep').length / entries.length
  const powerLevel = Math.round(
    avgScore * entries.length * (0.5 + keepRate * 0.5),
  )

  return {
    xp,
    level: levelIdx,
    levelName: LEVELS[levelIdx].name,
    nextLevelXp: nextThreshold,
    progress,
    powerLevel,
  }
}

export function usePowerLevel(entries: CycleEntry[] | undefined): PowerLevel {
  return useMemo(() => computePowerLevel(entries ?? []), [entries])
}
