import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorCount: 0 };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        this.setState((prev) => ({ errorCount: prev.errorCount + 1 }));

        // Log to monitoring service (Sentry, LogRocket, etc.)
        console.error('[ErrorBoundary]', error, info);

        // Send to backend for monitoring (Fire and forget)
        fetch(`${import.meta.env.VITE_API_URL}/logs/error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
            }),
        }).catch(() => { }); // Ignore logging errors
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="card p-8 max-w-md text-center border-2 border-destructive/20 bg-card rounded-lg shadow-lg">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-destructive/10">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold mb-2 text-foreground">Oops! Something went wrong</h1>

                        <p className="text-muted-foreground mb-6 text-sm">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                    Error details (Dev only)
                                </summary>
                                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40 text-left">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}

                        <div className="space-y-3">
                            <Button
                                onClick={this.handleReset}
                                className="w-full"
                                variant="default"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>

                            <Button
                                onClick={() => (window.location.href = '/')}
                                variant="outline"
                                className="w-full"
                            >
                                Go Home
                            </Button>
                        </div>

                        {this.state.errorCount > 3 && (
                            <p className="mt-4 text-xs text-yellow-600 dark:text-yellow-400">
                                Multiple errors detected. Consider refreshing the page.
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
