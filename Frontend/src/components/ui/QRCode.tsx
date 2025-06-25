import { useState } from 'react';
import { cn } from '@/lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  blurred?: boolean;
  isPlaceholder?: boolean;
  altText?: string;
  showData?: boolean;
  wrapperClassName?: string;
}

export function QRCode({
  value,
  size = 128,
  className,
  blurred = false,
  isPlaceholder = false,
  altText = "QR Code",
  showData = false,
  wrapperClassName
}: QRCodeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const baseImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?';
  const qrImageUrl = isPlaceholder 
    ? `https://fakeimg.pl/${size}x${size}/e0e0e0/757575?text=QR+PLACEHOLDER` 
    : `${baseImageUrl}size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-4 rounded-lg',
      blurred ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-300',
      'border border-gray-300 dark:border-gray-600',
      wrapperClassName
    )}>
      <div className={cn('relative', className)}>
        <img
          src={qrImageUrl}
          alt={isPlaceholder ? "QR Code Placeholder" : altText}
          className={cn(
            'object-contain rounded-md transition-all duration-200',
            !isLoaded && 'opacity-0',
            blurred && 'filter blur-md opacity-60',
            !isPlaceholder && !blurred && 'bg-white p-1'
          )}
          style={{ width: size, height: size }}
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-senai-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {showData && !isPlaceholder && !blurred && (
        <p className={`mt-2 text-xs text-center text-gray-600 dark:text-gray-700 break-all max-w-[${size}px]`}>
          Data: {value.length > 30 ? value.substring(0, 30) + '...' : value}
        </p>
      )}
      {isPlaceholder && blurred && (
        <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">QR Code Oculto</p>
      )}
    </div>
  );
}
