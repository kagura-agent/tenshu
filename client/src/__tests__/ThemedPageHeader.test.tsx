import { describe, it, expect } from 'vitest'
import { renderWithTheme } from './helpers'
import { ThemedPageHeader } from '../components/ThemedPageHeader'

describe('ThemedPageHeader', () => {
  it('renders the kanji and title text', () => {
    const { getByText } = renderWithTheme(
      <ThemedPageHeader kanji="作戦" title="Operations" />,
    )
    expect(getByText(/作戦/)).toBeTruthy()
    expect(getByText('Operations')).toBeTruthy()
  })

  it('renders decorative separator lines', () => {
    const { container } = renderWithTheme(
      <ThemedPageHeader kanji="概" title="Dashboard" />,
    )
    // Should have the bottom decorative line (h-px w-full)
    const lines = container.querySelectorAll('.h-px')
    expect(lines.length).toBeGreaterThanOrEqual(1)
  })

  it('renders an h1 element', () => {
    const { container } = renderWithTheme(
      <ThemedPageHeader kanji="天" title="Tenshu" />,
    )
    const h1 = container.querySelector('h1')
    expect(h1).not.toBeNull()
    expect(h1?.textContent).toContain('天')
    expect(h1?.textContent).toContain('Tenshu')
  })
})
