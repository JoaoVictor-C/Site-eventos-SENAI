import React from 'react';
import { cn } from '@/utils/helpers';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'large' | 'small' | 'muted' | 'title' | 'body' | 'heading1' | 'heading2' | 'heading3';
  as?: React.ElementType;
}

const variantStyles = {
  default: 'leading-7',
  h1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  lead: 'text-xl font-semibold',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
  title: 'text-2xl font-bold',
  body: 'text-base leading-7',
  heading1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  heading2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  heading3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
} as const;

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
