import { describe, it, expect } from 'vitest'
import { renderWithTheme } from './helpers'
import { ThemedCard } from '../components/ThemedCard'

describe('ThemedCard', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(<ThemedCard>Hello World</ThemedCard>)
    expect(getByText('Hello World')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <ThemedCard className="my-custom-class">Content</ThemedCard>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.classList.contains('my-custom-class')).toBe(true)
  })

  it('applies custom inline style', () => {
    const { container } = renderWithTheme(
      <ThemedCard style={{ maxWidth: '300px' }}>Content</ThemedCard>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.style.maxWidth).toBe('300px')
  })

  it('sets cursor to pointer when onClick is provided', () => {
    const { container } = renderWithTheme(
      <ThemedCard onClick={() => {}}>Clickable</ThemedCard>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.style.cursor).toBe('pointer')
  })

  it('does not set cursor when onClick is absent', () => {
    const { container } = renderWithTheme(<ThemedCard>Static</ThemedCard>)
    const card = container.firstElementChild as HTMLElement
    // cursor should be empty or undefined, not 'pointer'
    expect(card.style.cursor).not.toBe('pointer')
  })

  it('fires onClick handler when clicked', async () => {
    let clicked = false
    const { container } = renderWithTheme(
      <ThemedCard onClick={() => (clicked = true)}>Click Me</ThemedCard>,
    )
    const card = container.firstElementChild as HTMLElement
    card.click()
    expect(clicked).toBe(true)
  })

  it('applies glow box-shadow when glow prop is true', () => {
    const { container } = renderWithTheme(<ThemedCard glow>Glowing</ThemedCard>)
    const card = container.firstElementChild as HTMLElement
    // When glow is true the box-shadow contains the border color (0 0 20px ...)
    expect(card.style.boxShadow).toContain('20px')
  })

  it('applies standard box-shadow when glow is false', () => {
    const { container } = renderWithTheme(<ThemedCard>Normal</ThemedCard>)
    const card = container.firstElementChild as HTMLElement
    expect(card.style.boxShadow).toContain('rgba(0')
  })
})
