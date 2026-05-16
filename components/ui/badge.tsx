import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase',
  {
    variants: {
      variant: {
        new: 'bg-blue-100 text-blue-800',
        preparing: 'bg-amber-100 text-amber-800',
        ready: 'bg-emerald-100 text-emerald-800',
        delivered: 'bg-charcoal/10 text-charcoal/60',
        neutral: 'bg-cream-warm text-charcoal/70',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
