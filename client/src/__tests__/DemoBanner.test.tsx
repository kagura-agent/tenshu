import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { DemoBanner } from '../components/DemoBanner'

// Mock useDemo to control isDemo in tests
vi.mock('@/hooks/useDemo', () => ({
  useDemo: vi.fn(() => ({ isDemo: false })),
}))

import { useDemo } from '@/hooks/useDemo'
const mockUseDemo = vi.mocked(useDemo)

describe('DemoBanner', () => {
  it('renders nothing when not in demo mode', () => {
    mockUseDemo.mockReturnValue({ isDemo: false })
    const { container } = render(<DemoBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renders a banner when in demo mode', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    const { getByText } = render(<DemoBanner />)
    expect(getByText(/Demo Mode/)).toBeTruthy()
  })

  it('links to the GitHub repo', () => {
    mockUseDemo.mockReturnValue({ isDemo: true })
    const { container } = render(<DemoBanner />)
    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe(
      'https://github.com/JesseRWeigel/tenshu',
    )
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
