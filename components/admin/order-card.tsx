import { Badge } from '@/components/ui/badge';
import { StatusSelect } from './status-select';
import { formatUSD } from '@/lib/format';
import type { Order } from '@/lib/supabase/types';

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="bg-white rounded-lg border border-charcoal/10 p-5 lg:p-6 shadow-sm">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-charcoal/40">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <h3 className="font-serif text-xl text-charcoal mt-1">{order.customer_name}</h3>
          <p className="text-sm text-charcoal/60 mt-0.5">
            {order.phone} · {relativeTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={order.status as any}>{order.status}</Badge>
          <StatusSelect orderId={order.id} initial={order.status} />
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-charcoal/50">Type:</span>{' '}
          <span className="text-charcoal capitalize">{order.order_type}</span>
        </div>
        {order.order_type === 'delivery' && order.address && (
          <div className="text-charcoal/70 max-w-md">
            <span className="text-charcoal/50">Address:</span>{' '}
            {order.address.street}{order.address.apt ? `, ${order.address.apt}` : ''}, {order.address.city}, {order.address.state} {order.address.zip}
            {order.address.instructions && (
              <p className="text-xs text-charcoal/50 mt-1 italic">&ldquo;{order.address.instructions}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      <ul className="mt-4 border-t border-charcoal/10 pt-4 space-y-1.5 text-[14px]">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span className="text-charcoal">
              <span className="text-charcoal/50 mr-1.5">{it.qty}×</span>
              {it.name}
            </span>
            <span className="text-charcoal/70 tabular-nums">{formatUSD(it.qty * it.price)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-charcoal/10 pt-3 flex items-baseline justify-between text-sm">
        <div className="space-y-0.5">
          <p className="text-charcoal/50">Subtotal: <span className="text-charcoal/80">{formatUSD(order.subtotal)}</span></p>
          {order.discount > 0 && (
            <p className="text-forest">Promo {order.promo_code}: <span>−{formatUSD(order.discount)}</span></p>
          )}
          {order.delivery_fee > 0 && (
            <p className="text-charcoal/50">Delivery: <span className="text-charcoal/80">{formatUSD(order.delivery_fee)}</span></p>
          )}
          <p className="text-charcoal/50">Payment: <span className="text-charcoal/80 capitalize">{order.payment_method === 'cod' ? 'Cash on ' + (order.order_type === 'pickup' ? 'pickup' : 'delivery') : order.payment_method}</span></p>
        </div>
        <p className="font-serif text-xl text-forest">{formatUSD(order.total)}</p>
      </div>

      {order.notes && (
        <p className="mt-4 text-sm text-charcoal/70 bg-cream-warm/50 border-l-2 border-forest/40 px-4 py-3 rounded-r">
          <span className="text-charcoal/50 mr-1">Notes:</span>{order.notes}
        </p>
      )}
    </article>
  );
}
