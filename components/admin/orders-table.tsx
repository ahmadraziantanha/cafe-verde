'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, Truck, ShoppingBag, MapPin, Phone, StickyNote } from 'lucide-react';
import { StatusPill } from './status-pill';
import { StatusSelect } from './status-select';
import { formatUSD } from '@/lib/format';
import type { Order } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 py-20 text-center">
        <p className="font-serif text-xl text-slate-700">No orders yet.</p>
        <p className="text-[13.5px] text-slate-500 mt-1.5">
          When a customer checks out, their order will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60 text-left text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3 w-8"></th>
              <th className="px-2 py-3">Order</th>
              <th className="px-2 py-3">Customer</th>
              <th className="px-2 py-3">Type</th>
              <th className="px-2 py-3">Items</th>
              <th className="px-2 py-3 text-right">Total</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Time</th>
              <th className="px-5 py-3 w-[170px]">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const isOpen = open === o.id;
              const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <Fragment key={o.id}>
                  <tr
                    className={cn(
                      'border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer',
                      o.status === 'delivered' && 'opacity-65',
                    )}
                    onClick={() => setOpen(isOpen ? null : o.id)}
                  >
                    <td className="px-5 py-4">
                      <ChevronDown
                        className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', isOpen && 'rotate-180')}
                      />
                    </td>
                    <td className="px-2 py-4 font-mono text-[12px] text-slate-500">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-2 py-4">
                      <p className="font-medium text-charcoal">{o.customer_name}</p>
                      <p className="text-[12px] text-slate-500 tabular-nums">{o.phone}</p>
                    </td>
                    <td className="px-2 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 capitalize">
                        {o.order_type === 'delivery' ? (
                          <Truck className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        {o.order_type}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-slate-600 tabular-nums">{itemCount}</td>
                    <td className="px-2 py-4 text-right font-medium text-charcoal tabular-nums">
                      {formatUSD(o.total)}
                    </td>
                    <td className="px-2 py-4">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-2 py-4 text-slate-500 tabular-nums">{relativeTime(o.created_at)}</td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect orderId={o.id} initial={o.status} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/40 border-b border-slate-100">
                      <td></td>
                      <td colSpan={8} className="px-2 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr,260px] gap-8 pr-5">
                          {/* Items */}
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Items</p>
                            <ul className="space-y-2">
                              {o.items.map((it, i) => (
                                <li key={i} className="flex justify-between text-[13px]">
                                  <span className="text-charcoal">
                                    <span className="text-slate-400 mr-2 tabular-nums">{it.qty}×</span>
                                    {it.name}
                                  </span>
                                  <span className="text-slate-500 tabular-nums">{formatUSD(it.qty * it.price)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Customer / Address */}
                          <div className="space-y-3 text-[13px]">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Details</p>
                            <div className="flex items-start gap-2 text-slate-700">
                              <Phone className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />
                              <span className="tabular-nums">{o.phone}</span>
                            </div>
                            {o.order_type === 'delivery' && o.address && (
                              <div className="flex items-start gap-2 text-slate-700">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                  <p>
                                    {o.address.street}
                                    {o.address.apt ? `, ${o.address.apt}` : ''}
                                  </p>
                                  <p className="text-slate-500">
                                    {o.address.city}, {o.address.state} {o.address.zip}
                                  </p>
                                  {o.address.instructions && (
                                    <p className="mt-1.5 text-[12px] italic text-slate-500">&ldquo;{o.address.instructions}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {o.notes && (
                              <div className="flex items-start gap-2 text-slate-700">
                                <StickyNote className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />
                                <span className="text-[12.5px]">{o.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Totals */}
                          <div className="text-[13px]">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Total</p>
                            <dl className="space-y-1.5">
                              <Row label="Subtotal" value={formatUSD(o.subtotal)} />
                              {o.discount > 0 && (
                                <Row
                                  label={`Promo ${o.promo_code ?? ''}`.trim()}
                                  value={`−${formatUSD(o.discount)}`}
                                  accent
                                />
                              )}
                              {o.delivery_fee > 0 && <Row label="Delivery" value={formatUSD(o.delivery_fee)} />}
                              <Row
                                label="Payment"
                                value={
                                  o.payment_method === 'cod'
                                    ? `Cash on ${o.order_type === 'pickup' ? 'pickup' : 'delivery'}`
                                    : o.payment_method
                                }
                              />
                              <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                                <span className="text-slate-500">Total</span>
                                <span className="font-serif text-lg text-forest tabular-nums">
                                  {formatUSD(o.total)}
                                </span>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'text-forest' : 'text-charcoal')}>{value}</dd>
    </div>
  );
}
