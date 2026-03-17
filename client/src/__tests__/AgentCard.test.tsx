import { describe, it, expect } from 'vitest'
import { renderWithProviders, makeAgent } from './helpers'
import { AgentCard } from '../components/AgentCard'
import type { PowerLevel } from '../hooks/usePowerLevel'

describe('AgentCard', () => {
  it('renders the agent name', () => {
    const agent = makeAgent({ config: { name: 'Bulma' } })
    const { getByText } = renderWithProviders(<AgentCard agent={agent} />)
    expect(getByText('Bulma')).toBeTruthy()
  })

  it('renders the agent status badge', () => {
    const agent = makeAgent({ state: { status: 'working' } })
    const { getByText } = renderWithProviders(<AgentCard agent={agent} />)
    expect(getByText('working')).toBeTruthy()
  })

  it('renders currentTask when present', () => {
    const agent = makeAgent({ state: { currentTask: 'Reviewing PR #42' } })
    const { getByText } = renderWithProviders(<AgentCard agent={agent} />)
    expect(getByText('Reviewing PR #42')).toBeTruthy()
  })

  it('does not render task text when currentTask is absent', () => {
    const agent = makeAgent({ state: { currentTask: undefined } })
    const { queryByText } = renderWithProviders(<AgentCard agent={agent} />)
    expect(queryByText('Reviewing PR #42')).toBeNull()
  })

  it('renders the model when present', () => {
    const agent = makeAgent({ state: { model: 'gpt-4o' } })
    const { getByText } = renderWithProviders(<AgentCard agent={agent} />)
    expect(getByText('gpt-4o')).toBeTruthy()
  })

  it('renders power level info when provided', () => {
    const agent = makeAgent()
    const power: PowerLevel = {
      xp: 1200,
      level: 1,
      levelName: 'Chunin',
      nextLevelXp: 2000,
      progress: 0.7,
      powerLevel: 42,
    }
    const { getByText } = renderWithProviders(
      <AgentCard agent={agent} power={power} />,
    )
    expect(getByText('Chunin')).toBeTruthy()
    expect(getByText('PL:42')).toBeTruthy()
  })

  it('does not render power level when xp is 0', () => {
    const agent = makeAgent()
    const power: PowerLevel = {
      xp: 0,
      level: 0,
      levelName: 'Genin',
      nextLevelXp: 500,
      progress: 0,
      powerLevel: 0,
    }
    const { queryByText } = renderWithProviders(
      <AgentCard agent={agent} power={power} />,
    )
    // Genin badge should not render when xp is 0
    expect(queryByText('Genin')).toBeNull()
  })

  it('renders the agent sprite image', () => {
    const agent = makeAgent({
      config: { id: 'coder-bulma', name: 'Bulma' },
    })
    const { container } = renderWithProviders(<AgentCard agent={agent} />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('alt')).toBe('Bulma')
  })

  it('applies left border color from agent color', () => {
    const agent = makeAgent({ color: '#e91e63' })
    const { container } = renderWithProviders(<AgentCard agent={agent} />)
    // ThemedCard is the outer div, check borderLeftColor
    const card = container.firstElementChild as HTMLElement
    // jsdom normalizes hex to rgb
    expect(card.style.borderLeftColor).toBe('rgb(233, 30, 99)')
  })
})
