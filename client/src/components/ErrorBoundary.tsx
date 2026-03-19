import { Component, type ErrorInfo, type ReactNode } from 'react'

interface PageErrorFallbackProps {
  error: Error
  resetError: () => void
}

export function PageErrorFallback({ error, resetError }: PageErrorFallbackProps) {
  const isDev = import.meta.env.DEV

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="mb-2 text-xl font-semibold text-zinc-100">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          An unexpected error occurred while rendering this page.
        </p>
        {isDev && (
          <pre className="mb-6 max-h-40 overflow-auto rounded-lg bg-zinc-950 p-4 text-left text-xs text-red-400">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
        <button
          onClick={resetError}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (props: PageErrorFallbackProps) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback ?? PageErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}
