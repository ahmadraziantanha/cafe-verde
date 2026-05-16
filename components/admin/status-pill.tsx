import type { OrderStatus } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

const STYLES: Record<OrderStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  preparing: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  delivered: 'bg-slate-100 text-slate-600 ring-slate-500/15',
};

const DOT: Record<OrderStatus, string> = {
  new: 'bg-blue-500',
  preparing: 'bg-amber-500',
  ready: 'bg-emerald-500',
  delivered: 'bg-slate-400',
};

const LABEL: Record<OrderStatus, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ring-1 ring-inset tabular-nums',
        STYLES[status],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[status])} />
      {LABEL[status]}
    </span>
  );
}
