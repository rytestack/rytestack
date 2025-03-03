/**
 * @fileoverview ErrorBoundary component
 *
 * Error boundary for catching and handling rendering errors.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
    /**
     * Custom fallback component or element to show when an error occurs
     */
    fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

    /**
     * Callback fired when an error is caught
     */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;

    /**
     * Children to render
     */
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for handling React rendering errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
        this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    resetError(): void {
        this.setState({ hasError: false, error: null });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            const { fallback } = this.props;

            if (fallback) {
                if (typeof fallback === 'function' && this.state.error) {
                    return fallback(this.state.error, this.resetError);
                }
                return fallback;
            }

            return (
                <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-md">
                    <h2 className="text-red-800 text-lg font-medium">Something went wrong</h2>
                    <p className="text-red-600 mt-1">
                        {this.state.error?.message || 'An error occurred during rendering'}
                    </p>
                    <button
                        className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                        onClick={this.resetError}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}