import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
}

export function ErrorBoundary({ children, fallback = ErrorFallback, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onReset={onReset}
      onError={(error) => {
        console.error('ErrorBoundary caught an error:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
