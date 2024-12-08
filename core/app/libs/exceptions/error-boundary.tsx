import { Component, ErrorInfo, ReactNode, isValidElement } from 'react';
import { getLogger, getMonitoring } from '~/app/libs/datadog';

type FallbackRenderer = (error: Error, reset: () => void) => React.ReactNode;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  prevScope: string;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | FallbackRenderer;
  scope?: string;
}

//  To test the ErrorBoundary, throw an error from a reachable section in the component tree which is not:
//  - Event handlers
//  - Asynchronous code (e.g. setTimeout or requestAnimationFrame callbacks)
//  - Server side rendering
//  - Errors thrown in the error boundary itself (rather than its children)
//  https://stackoverflow.com/questions/57943149/react-error-boundaries-not-working-with-react

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, prevScope: props.scope || 'error-boundary' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (state.prevScope !== props.scope) {
      return {
        hasError: false,
        error: undefined,
        prevScope: props.scope,
      };
    }

    return state;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { scope } = this.props;

    const message = `[ErrorBoundary Error]: ${scope || ''}`;

    getLogger().error(message, {
      errorBoundaryErrorInfo: errorInfo,
      scope,
    });

    getMonitoring().addError(error, { scope });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (isValidElement(fallback) || typeof fallback === 'string') {
      return fallback;
    }
    if (typeof fallback === 'function') {
      return fallback(error, () => this.setState({ hasError: false, error: undefined }));
    }

    return null;
  }
}
