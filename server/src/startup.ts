import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { DEFAULT_OPENCLAW_DIR } from '@tenshu/shared'

function resolvePath(p: string): string {
  return p.replace(/^~(?=\/|$)/, homedir())
}

export interface DirectoryWarning {
  label: string
  path: string
}

/**
 * Validate that expected directories exist at startup.
 * Logs a warning for each missing directory but never throws or exits.
 */
export function validateDirectories(): DirectoryWarning[] {
  try {
    const openclawDir = resolvePath(
      process.env.OPENCLAW_DIR || DEFAULT_OPENCLAW_DIR,
    )
    const teamDir = resolvePath(
      process.env.TEAM_DIR || `${process.env.HOME}/clawd/team`,
    )
    const resultsTsv = resolvePath(
      process.env.RESULTS_TSV ||
        `${process.env.HOME}/clawd/team/knowledge/results.tsv`,
    )

    const checks: Array<{ label: string; path: string }> = [
      { label: 'OPENCLAW_DIR', path: openclawDir },
      { label: 'TEAM_DIR', path: teamDir },
      { label: 'TEAM_DIR/knowledge', path: join(teamDir, 'knowledge') },
      {
        label: 'TEAM_DIR/knowledge/artifacts',
        path: join(teamDir, 'knowledge', 'artifacts'),
      },
      { label: 'RESULTS_TSV parent dir', path: dirname(resultsTsv) },
    ]

    const warnings: DirectoryWarning[] = []

    for (const { label, path } of checks) {
      if (!existsSync(path)) {
        console.warn(`[tenshu] Missing directory: ${label} → ${path}`)
        warnings.push({ label, path })
      }
    }

    if (warnings.length > 0) {
      console.warn(
        `[tenshu] ${warnings.length} directory warning(s) — some features may not work until these directories exist.`,
      )
    }

    return warnings
  } catch (e) {
    console.warn('[tenshu] Directory validation failed:', (e as Error).message)
    return []
  }
}
