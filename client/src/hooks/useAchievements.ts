import { useMemo } from 'react'
import type { ResultRow } from '@tenshu/shared'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  check: (rows: ResultRow[]) => string | null // returns timestamp if unlocked, null otherwise
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete the first task',
    icon: '🗡️',
    check: (rows) => (rows.length > 0 ? rows[0].timestamp : null),
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Achieve a 10.0 score',
    icon: '💎',
    check: (rows) => {
      const r = rows.find((r) => r.score >= 10)
      return r?.timestamp ?? null
    },
  },
  {
    id: 'hat-trick',
    name: 'Hat Trick',
    description: '3 keeps in a row',
    icon: '🎩',
    check: (rows) => {
      let streak = 0
      for (const r of rows) {
        if (r.status === 'keep') {
          streak++
          if (streak >= 3) return r.timestamp
        } else streak = 0
      }
      return null
    },
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: '5 keeps in a row',
    icon: '🔥',
    check: (rows) => {
      let streak = 0
      for (const r of rows) {
        if (r.status === 'keep') {
          streak++
          if (streak >= 5) return r.timestamp
        } else streak = 0
      }
      return null
    },
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: '10 keeps in a row',
    icon: '🛡️',
    check: (rows) => {
      let streak = 0
      for (const r of rows) {
        if (r.status === 'keep') {
          streak++
          if (streak >= 10) return r.timestamp
        } else streak = 0
      }
      return null
    },
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Keep after a discard',
    icon: '🔄',
    check: (rows) => {
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].status === 'keep' && rows[i - 1].status === 'discard')
          return rows[i].timestamp
      }
      return null
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Task completed after midnight',
    icon: '🦉',
    check: (rows) => {
      const r = rows.find((r) => {
        const h = new Date(r.timestamp).getHours()
        return h >= 0 && h < 5
      })
      return r?.timestamp ?? null
    },
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: '5 cycles with score > 7',
    icon: '📈',
    check: (rows) => {
      const good = rows.filter((r) => r.score > 7)
      return good.length >= 5 ? good[4].timestamp : null
    },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Every task type completed at least once',
    icon: '🌈',
    check: (rows) => {
      const tasks = new Set(rows.map((r) => r.task))
      // Need at least 4 distinct task types
      if (tasks.size >= 4) {
        return rows[rows.length - 1].timestamp
      }
      return null
    },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 cycles',
    icon: '💯',
    check: (rows) => (rows.length >= 100 ? rows[99].timestamp : null),
  },
]

export function useAchievements(rows: ResultRow[]): Achievement[] {
  return useMemo(() => {
    return ACHIEVEMENTS.map((def) => {
      const unlockedAt = def.check(rows)
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: unlockedAt !== null,
        unlockedAt: unlockedAt ?? undefined,
      }
    })
  }, [rows])
}
