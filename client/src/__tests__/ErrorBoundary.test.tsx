import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ErrorBoundary, PageErrorFallback } from '../components/ErrorBoundary'

function ThrowingComponent({ message }: { message?: string }): ReactNode {
  throw new Error(message ?? 'Test error')
}

describe('ErrorBoundary', () => {
  // Suppress React error boundary console.error noise in tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>,
    )
    expect(getByText('All good')).toBeTruthy()
  })

  it('renders fallback UI when a child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(getByText('Something went wrong')).toBeTruthy()
    expect(getByText('Try again')).toBeTruthy()
  })

  it('resets error state when "Try again" is clicked', () => {
    let shouldThrow = true

    function MaybeThrow() {
      if (shouldThrow) {
        throw new Error('Boom')
      }
      return <div>Recovered</div>
    }

    const { getByText } = render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    )

    expect(getByText('Something went wrong')).toBeTruthy()

    // Fix the "error" and click retry
    shouldThrow = false
    fireEvent.click(getByText('Try again'))

    expect(getByText('Recovered')).toBeTruthy()
  })

  it('renders custom fallback when provided', () => {
    function CustomFallback({
      error,
      resetError,
    }: {
      error: Error
      resetError: () => void
    }) {
      return (
        <div>
          <span>Custom: {error.message}</span>
          <button onClick={resetError}>Reset</button>
        </div>
      )
    }

    const { getByText } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowingComponent message="custom error" />
      </ErrorBoundary>,
    )
    expect(getByText('Custom: custom error')).toBeTruthy()
  })

  it('logs error info to console', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="logged error" />
      </ErrorBoundary>,
    )

    expect(console.error).toHaveBeenCalled()
  })
})

describe('PageErrorFallback', () => {
  it('renders error message and try again button', () => {
    const resetError = vi.fn()
    const error = new Error('Page broke')

    const { getByText } = render(
      <PageErrorFallback error={error} resetError={resetError} />,
    )

    expect(getByText('Something went wrong')).toBeTruthy()
    expect(getByText('Try again')).toBeTruthy()
  })

  it('calls resetError when button is clicked', () => {
    const resetError = vi.fn()
    const error = new Error('Page broke')

    const { getByText } = render(
      <PageErrorFallback error={error} resetError={resetError} />,
    )

    fireEvent.click(getByText('Try again'))
    expect(resetError).toHaveBeenCalledOnce()
  })

  it('shows error details in dev mode', () => {
    const resetError = vi.fn()
    const error = new Error('Dev error details')

    // import.meta.env.DEV is true in vitest by default
    const { getByText } = render(
      <PageErrorFallback error={error} resetError={resetError} />,
    )

    expect(getByText(/Dev error details/)).toBeTruthy()
  })
})
