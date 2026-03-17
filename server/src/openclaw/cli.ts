import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Session, CronJob, CronRun } from '@tenshu/shared'

const execFileAsync = promisify(execFile)

async function run(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('openclaw', args, { timeout: 15000 })
    return stdout.trim()
  } catch (e) {
    const err = e as Error & { stderr?: string }
    throw new Error(
      `openclaw ${args.join(' ')} failed: ${err.stderr || err.message}`,
    )
  }
}

function parseJSON(raw: string): unknown {
  const trimmed = raw.trim()
  // Find the first { or [ (whichever comes first)
  const braceIdx = trimmed.indexOf('{')
  const bracketIdx = trimmed.indexOf('[')
  let start: number
  if (braceIdx === -1 && bracketIdx === -1) {
    throw new Error(`Unexpected CLI output: ${trimmed.slice(0, 100)}`)
  } else if (braceIdx === -1) {
    start = bracketIdx
  } else if (bracketIdx === -1) {
    start = braceIdx
  } else {
    start = Math.min(braceIdx, bracketIdx)
  }
  return JSON.parse(trimmed.slice(start))
}

interface CLISessionOutput {
  sessions?: CLISession[]
}

interface CLISession {
  sessionId: string
  agentId: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  updatedAt?: number
  key?: string
}

export async function listSessions(): Promise<Session[]> {
  const raw = await run(['sessions', '--all-agents', '--json'])
  const parsed = parseJSON(raw) as CLISessionOutput
  const sessions = parsed.sessions ?? []
  return sessions.map((s) => ({
    id: s.sessionId,
    agentId: s.agentId,
    label: s.key,
    startedAt: s.updatedAt
      ? new Date(s.updatedAt).toISOString()
      : new Date().toISOString(),
    lastActivity: s.updatedAt
      ? new Date(s.updatedAt).toISOString()
      : new Date().toISOString(),
    inputTokens: s.inputTokens ?? 0,
    outputTokens: s.outputTokens ?? 0,
    totalTokens: s.totalTokens ?? 0,
    model: s.model ?? 'unknown',
    cost: 0, // local models = $0
  }))
}

interface CLICronOutput {
  jobs?: CronJob[]
}

export async function listCronJobs(): Promise<CronJob[]> {
  const raw = await run(['cron', 'list', '--json', '--all'])
  const parsed = parseJSON(raw) as CLICronOutput
  return parsed.jobs ?? []
}

export async function toggleCronJob(
  id: string,
  enabled: boolean,
): Promise<void> {
  await run(['cron', enabled ? 'enable' : 'disable', id])
}

export async function runCronJob(id: string): Promise<void> {
  await run(['cron', 'run', id, '--force'])
}

export async function getCronRuns(id: string): Promise<CronRun[]> {
  const raw = await run(['cron', 'runs', id, '--json'])
  return parseJSON(raw) as CronRun[]
}
