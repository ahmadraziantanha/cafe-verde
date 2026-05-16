import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-md border border-charcoal/15 bg-cream/40 px-4 text-[15px] text-charcoal placeholder:text-charcoal/40 transition-colors focus-visible:outline-none focus-visible:border-forest focus-visible:bg-cream disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
