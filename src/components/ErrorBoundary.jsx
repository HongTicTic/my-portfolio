import { Component } from 'react'

// Error boundaries must be class components - there is no hook
// equivalent (as of React 18) for getDerivedStateFromError /
// componentDidCatch. This one is generic: give it a `label` for
// the section it's guarding and it renders its own fallback UI
// without taking the rest of the page down with it.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Runs during the render phase - use it only to update state,
  // no side effects here.
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // Runs during the commit phase - fine for side effects like
  // logging to an error-tracking service.
  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary:${this.props.label ?? 'section'}]`, error, errorInfo)
  }

  handleRetry = () => {
    // Clearing hasError re-attempts rendering the children. If the
    // underlying bug is still there it'll just throw again and we're
    // back in this same fallback - that's expected, not a bug in the
    // boundary itself.
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">
            Something went wrong{this.props.label ? ` in ${this.props.label}` : ''}.
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-3 border border-red-300 px-3 py-1.5 text-xs font-medium hover:border-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
