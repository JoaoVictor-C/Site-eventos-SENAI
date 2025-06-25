import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and merges Tailwind classes properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency using the provided locale and currency code.
 * 
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'pt-BR')
 * @param currency - The currency code to use (default: 'BRL')
 * @returns A formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format price as Brazilian currency (alias for formatCurrency)
 */
export const formatPrice = formatCurrency;

/**
 * Format date to Brazilian format without time
 * 
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format datetime to Brazilian format with time
 * 
 * @param date - The date to format
 * @param options - Optional formatting options
 * @returns A formatted datetime string
 */
export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('pt-BR', options || defaultOptions)
    .format(new Date(date));
}

/**
 * Safely access nested object properties
 */
export function getNestedValue<T>(obj: Record<string, unknown>, path: string, defaultValue: T): T {
  return path.split('.').reduce((acc, part) => acc?.[part], obj as any) ?? defaultValue;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
