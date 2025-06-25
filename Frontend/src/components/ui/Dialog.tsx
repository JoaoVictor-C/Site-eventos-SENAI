import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Text } from './Text';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={cn(
            'bg-white dark:bg-gray-900 rounded-lg shadow-xl pointer-events-auto',
            'max-w-lg w-11/12 max-h-[90vh] overflow-y-auto',
            'transform transition-all duration-200',
            className
          )}
        >
          {title && (
            <div className="px-6 py-4 border-b dark:border-gray-800">
              <Text variant="h3">{title}</Text>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
