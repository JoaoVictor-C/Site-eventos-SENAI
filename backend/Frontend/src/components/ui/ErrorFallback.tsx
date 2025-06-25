import { Button } from './Button';
import { Text } from './Text';
import { cn } from '@/utils';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  className?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, className }: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-red-50 p-4 dark:bg-red-900/20',
        className
      )}
      role="alert"
    >
      <div className="flex items-center space-x-4">
        <div className="shrink-0">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Text variant="lead" className="font-semibold text-red-800 dark:text-red-200">
            Algo deu errado!
          </Text>
          <Text variant="small" className="mt-1 text-red-700 dark:text-red-300">
            {error.message}
          </Text>
        </div>
      </div>
      {resetErrorBoundary && (
        <div className="mt-4 border-t border-red-100 pt-4 dark:border-red-900">
          <Button            variant="secondary"
            size="sm"
            onClick={resetErrorBoundary}
            className="w-full justify-center sm:w-auto"
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
