import { readFileSync, watchFile } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { AgentConfig } from '@tenshu/shared'

function resolvePath(p: string): string {
  return p.replace(/^~(?=\/|$)/, homedir())
}

export interface OpenClawConfig {
  agents: AgentConfig[]
  gatewayPort: number
  gatewayToken: string
}

let cached: OpenClawConfig | null = null
let configPath = ''

export function loadConfig(openclawDir: string): OpenClawConfig {
  configPath = join(resolvePath(openclawDir), 'openclaw.json')
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'))

  const agents: AgentConfig[] = (raw.agents?.list ?? []).map(
    (a: Record<string, unknown>) => ({
      id: a.id as string,
      name: a.name as string,
      workspace: a.workspace as string,
      default: a.default as boolean | undefined,
      model: a.model as AgentConfig['model'],
    }),
  )

  cached = {
    agents,
    gatewayPort: raw.gateway?.port ?? 18789,
    gatewayToken: raw.gateway?.auth?.token ?? '',
  }

  return cached
}

export function getConfig(): OpenClawConfig {
  if (!cached) throw new Error('Config not loaded — call loadConfig() first')
  return cached
}

export function watchConfig(
  openclawDir: string,
  onChange: (config: OpenClawConfig) => void,
): void {
  const path = join(resolvePath(openclawDir), 'openclaw.json')
  watchFile(path, { interval: 5000 }, () => {
    try {
      const updated = loadConfig(openclawDir)
      onChange(updated)
    } catch (e) {
      console.error('[tenshu] Failed to reload openclaw.json:', e)
    }
  })
}
