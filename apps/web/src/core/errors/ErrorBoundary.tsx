import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorCode: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorCode: '',
  };

  public static getDerivedStateFromError(_error: Error): State {
    const errorCode = `ERR_${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, errorCode };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely without request body or user text
    console.error('[ErrorBoundary] Caught error:', {
      message: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-900 p-6 rtl:text-right" dir="auto">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-amber-900 mb-2">Something went wrong</h2>
            <p className="text-stone-600 text-sm mb-4">
              The application encountered an unexpected issue. Your data is safe locally.
            </p>
            <div className="bg-stone-100 p-3 rounded-lg text-xs font-mono text-stone-700 mb-6">
              Reference Code: {this.state.errorCode}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
