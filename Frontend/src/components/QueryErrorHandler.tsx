import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface QueryErrorHandlerProps {
  children: React.ReactNode;
}

export function QueryErrorHandler({ children }: QueryErrorHandlerProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao carregar dados
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={resetErrorBoundary}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
