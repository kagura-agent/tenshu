/**
 * Shared test utilities — wrappers, providers, factory helpers.
 */
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { Agent, AgentConfig, AgentState } from '@tenshu/shared'

/**
 * Renders a component wrapped in ThemeProvider (needed by most UI components).
 */
export function renderWithTheme(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
    ...options,
  })
}

/**
 * Renders a component wrapped in ThemeProvider + QueryClientProvider.
 * Use for components that depend on react-query (e.g. AgentCard via useAvatarConfig).
 */
export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    ),
    ...options,
  })
}

/** Factory: build a minimal valid Agent object with sensible defaults. */
export function makeAgent(overrides?: {
  config?: Partial<AgentConfig>
  state?: Partial<AgentState>
  color?: string
  emoji?: string
}): Agent {
  return {
    config: {
      id: 'test-agent',
      name: 'Test Agent',
      workspace: '/tmp/test',
      ...overrides?.config,
    },
    state: {
      id: overrides?.config?.id ?? 'test-agent',
      status: 'idle',
      ...overrides?.state,
    },
    color: overrides?.color ?? '#ff6b35',
    emoji: overrides?.emoji ?? '🤖',
  }
}
