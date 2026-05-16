import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { formatUSD } from '@/lib/format';
import type { Order } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your orders', robots: { index: false, follow: false } };

export default async function OrdersPage() {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const orders = (data ?? []) as Order[];

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-charcoal/15 rounded-lg p-12 text-center">
        <p className="font-serif text-2xl text-charcoal/70">No orders yet.</p>
        <p className="text-sm text-charcoal/50 mt-2">Your orders will appear here.</p>
        <Link href="/menu" className="inline-flex items-center gap-2 mt-6 text-sm text-forest border-b border-forest/30 pb-1">
          Browse menu <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-charcoal/10 bg-white rounded-lg border border-charcoal/10">
      {orders.map((o) => (
        <li key={o.id} className="p-5 lg:p-6 hover:bg-cream-warm/40 transition-colors">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-mono text-charcoal/40">#{o.id.slice(0, 8).toUpperCase()}</p>
              <p className="font-serif text-lg text-charcoal mt-1">
                {o.items.length} item{o.items.length === 1 ? '' : 's'} · {o.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
              </p>
              <p className="text-sm text-charcoal/55 mt-0.5">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Badge variant={o.status as any}>{o.status}</Badge>
              <span className="font-serif text-lg text-charcoal">{formatUSD(o.total)}</span>
              <Link
                href={`/account/orders/${o.id}`}
                className="inline-flex items-center gap-1 text-sm text-forest border-b border-forest/30 pb-0.5"
              >
                Track <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
