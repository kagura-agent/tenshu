import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Sparkline } from '../components/Sparkline'

describe('Sparkline', () => {
  it('renders nothing with fewer than 2 values', () => {
    const { container } = render(<Sparkline values={[5]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders nothing with empty values', () => {
    const { container } = render(<Sparkline values={[]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders an SVG with 2+ values', () => {
    const { container } = render(<Sparkline values={[3, 5, 7]} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders a polyline and a circle', () => {
    const { container } = render(<Sparkline values={[3, 5, 7]} />)
    expect(container.querySelector('polyline')).not.toBeNull()
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('uses green stroke when trending up', () => {
    const { container } = render(<Sparkline values={[3, 5, 7, 9]} />)
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#22c55e')
  })

  it('uses red stroke when trending down', () => {
    const { container } = render(<Sparkline values={[9, 7, 5, 3]} />)
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#ef4444')
  })

  it('uses gray stroke when flat', () => {
    const { container } = render(<Sparkline values={[5, 5, 5, 5]} />)
    const polyline = container.querySelector('polyline')
    expect(polyline?.getAttribute('stroke')).toBe('#71717a')
  })

  it('respects custom width and height', () => {
    const { container } = render(
      <Sparkline values={[1, 2, 3]} width={100} height={32} />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('100')
    expect(svg?.getAttribute('height')).toBe('32')
  })
})
