'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { formatUSD } from '@/lib/format';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Placed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
};

export function OrderTracker({ initial }: { initial: Order }) {
  const [order, setOrder] = useState<Order>(initial);

  // Subscribe to real-time changes on this order row.
  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`order-${initial.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${initial.id}` },
        (payload) => setOrder(payload.new as Order),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.id]);

  const currentIdx = ORDER_STATUSES.indexOf(order.status);
  const statusLabel = order.status === 'delivered'
    ? (order.order_type === 'pickup' ? 'Picked up' : 'Delivered')
    : order.status === 'ready'
      ? (order.order_type === 'pickup' ? 'Ready for pickup' : 'Out for delivery')
      : STATUS_LABEL[order.status];

  return (
    <div className="space-y-8">
      <header className="bg-white rounded-lg border border-charcoal/10 p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono text-charcoal/40">#{order.id.slice(0, 8).toUpperCase()}</p>
            <h2 className="font-serif text-2xl lg:text-3xl tracking-tightest text-charcoal mt-1">
              {order.status === 'delivered' ? 'All done.' : 'Your order is on the way.'}
            </h2>
            <p className="text-sm text-charcoal/60 mt-2">
              {new Date(order.created_at).toLocaleString()} · {order.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-full">
            <span className={cn('w-1.5 h-1.5 rounded-full bg-emerald-600', order.status !== 'delivered' && 'animate-pulse')} />
            {statusLabel}
          </span>
        </div>

        {/* Timeline */}
        <ol className="mt-10 grid grid-cols-4 gap-2 relative">
          <div className="absolute top-[10px] left-[12.5%] right-[12.5%] h-px bg-charcoal/10" />
          <div
            className="absolute top-[10px] left-[12.5%] h-px bg-forest transition-all duration-700"
            style={{ width: `${(currentIdx / (ORDER_STATUSES.length - 1)) * 75}%` }}
          />
          {ORDER_STATUSES.map((s, i) => {
            const reached = i <= currentIdx;
            return (
              <li key={s} className="flex flex-col items-center relative">
                <span
                  className={cn(
                    'w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors',
                    reached
                      ? 'bg-forest text-cream'
                      : 'border-2 border-charcoal/15 bg-cream',
                  )}
                >
                  {reached && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <p className={cn('text-[12px] mt-2', reached ? 'text-charcoal' : 'text-charcoal/45')}>
                  {STATUS_LABEL[s]}
                </p>
              </li>
            );
          })}
        </ol>
      </header>

      {/* Address (if delivery) */}
      {order.order_type === 'delivery' && order.address && (
        <section className="bg-white rounded-lg border border-charcoal/10 p-6">
          <p className="eyebrow text-charcoal/50">Delivering to</p>
          <p className="text-charcoal mt-3 leading-relaxed">
            {order.address.street}{order.address.apt ? `, ${order.address.apt}` : ''}<br />
            {order.address.city}, {order.address.state} {order.address.zip}
          </p>
          {order.address.instructions && (
            <p className="text-sm text-charcoal/60 mt-2 italic">&ldquo;{order.address.instructions}&rdquo;</p>
          )}
        </section>
      )}

      {/* Items */}
      <section className="bg-white rounded-lg border border-charcoal/10 p-6">
        <p className="eyebrow text-charcoal/50">Order</p>
        <ul className="mt-4 divide-y divide-charcoal/10">
          {order.items.map((it, i) => (
            <li key={i} className="py-3 flex items-center justify-between text-[14.5px]">
              <span>
                <span className="text-charcoal/50 mr-2">{it.qty}×</span>{it.name}
              </span>
              <span className="tabular-nums text-charcoal/70">{formatUSD(it.qty * it.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-1.5 text-[14px]">
          <Row label="Subtotal" value={formatUSD(order.subtotal)} />
          {order.discount > 0 && (
            <Row label={`Promo ${order.promo_code ?? ''}`} value={`−${formatUSD(order.discount)}`} accent />
          )}
          {order.delivery_fee > 0 && <Row label="Delivery" value={formatUSD(order.delivery_fee)} />}
        </div>
        <div className="mt-4 pt-4 border-t border-charcoal/10 flex items-baseline justify-between">
          <span className="text-charcoal/70">Total</span>
          <span className="font-serif text-2xl text-forest">{formatUSD(order.total)}</span>
        </div>
        <p className="mt-4 text-xs text-charcoal/50">
          Payment: {order.payment_method === 'cod' ? 'Cash on ' + (order.order_type === 'pickup' ? 'pickup' : 'delivery') : 'Card'}
        </p>
      </section>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal/60">{label}</span>
      <span className={cn('tabular-nums', accent ? 'text-forest' : 'text-charcoal/80')}>{value}</span>
    </div>
  );
}
