import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[96px] w-full rounded-md border border-charcoal/15 bg-cream/40 px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal/40 transition-colors focus-visible:outline-none focus-visible:border-forest focus-visible:bg-cream disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
