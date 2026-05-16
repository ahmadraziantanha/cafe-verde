import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { formatUSD } from '@/lib/format';
import type { Order } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Account', robots: { index: false, follow: false } };

export default async function AccountOverview() {
  const user = await requireUser();
  const supabase = supabaseServer();

  const [{ data: latestOrder }, { count: orderCount }, { count: addressCount }] = await Promise.all([
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single<Order>(),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Orders" value={`${orderCount ?? 0}`} href="/account/orders" Icon={Clock} />
        <StatCard label="Saved addresses" value={`${addressCount ?? 0}`} href="/account/addresses" Icon={MapPin} />
      </div>

      <section>
        <h2 className="eyebrow text-charcoal/50 mb-4">Most recent order</h2>
        {!latestOrder ? (
          <div className="border border-dashed border-charcoal/15 rounded-lg p-10 text-center">
            <p className="font-serif text-xl text-charcoal/70">No orders yet.</p>
            <p className="text-sm text-charcoal/50 mt-2">Browse the menu and place your first order.</p>
            <Link href="/menu" className="inline-flex items-center gap-2 mt-6 text-sm text-forest border-b border-forest/30 pb-1">
              Browse menu <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <Link
            href={`/account/orders/${latestOrder.id}`}
            className="block bg-white rounded-lg border border-charcoal/10 p-5 hover:border-forest/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-charcoal/40">#{latestOrder.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-serif text-xl text-charcoal mt-1 capitalize">{latestOrder.status}</p>
                <p className="text-sm text-charcoal/60 mt-1">
                  {new Date(latestOrder.created_at).toLocaleString()}
                </p>
              </div>
              <span className="font-serif text-xl text-forest">{formatUSD(latestOrder.total)}</span>
            </div>
          </Link>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label, value, href, Icon,
}: { label: string; value: string; href: string; Icon: LucideIcon }) {
  return (
    <Link href={href} className="bg-white rounded-lg border border-charcoal/10 p-5 hover:border-forest/40 transition-colors">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-forest" strokeWidth={1.5} />
        <ArrowRight className="h-4 w-4 text-charcoal/30" />
      </div>
      <p className="font-serif text-3xl text-charcoal tracking-tightest mt-4">{value}</p>
      <p className="text-sm text-charcoal/55 mt-1">{label}</p>
    </Link>
  );
}
