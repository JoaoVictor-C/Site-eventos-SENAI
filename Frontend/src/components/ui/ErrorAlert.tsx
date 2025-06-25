import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorAlert({ title, message, action, className }: ErrorAlertProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/50',
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600 dark:text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          {message && (
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{message}</p>
            </div>
          )}
          {action && (
            <div className="mt-4">{action}</div>
          )}
        </div>
      </div>
    </div>
  );
}
