import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: 'forest' | 'amber' | 'blue' | 'slate';
}

const ACCENTS = {
  forest: 'bg-forest/10 text-forest',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, hint, icon, accent = 'forest' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08)] transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        {icon && (
          <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg', ACCENTS[accent])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-serif text-3xl text-charcoal tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[12.5px] text-slate-500">{hint}</p>}
    </div>
  );
}
