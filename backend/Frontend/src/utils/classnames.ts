import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines Tailwind CSS classes and handles conflicts.
 * Uses clsx for conditional classes and tailwind-merge for handling Tailwind conflicts.
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { clsx };
