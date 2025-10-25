'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Filter out third-party errors we don't care about
    const errorMsg = error.message || '';
    if (
      errorMsg.includes('Analytics SDK') ||
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('ERR_BLOCKED_BY_CLIENT')
    ) {
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log errors to console in development
    if (process.env.NODE_ENV === 'development') {
      const errorMsg = error.message || '';
      // Only log real errors, not third-party noise
      if (
        !errorMsg.includes('Analytics SDK') &&
        !errorMsg.includes('Failed to fetch') &&
        !errorMsg.includes('ERR_BLOCKED_BY_CLIENT')
      ) {
        console.error('Uncaught error:', error, errorInfo);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720] p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full border-2 border-[#FA2FB5]/30">
              <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
              <p className="text-gray-300 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
