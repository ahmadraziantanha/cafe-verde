'use client';

import Image from 'next/image';
import { formatUSD } from '@/lib/format';
import type { CartLine } from '@/lib/cart-store';

interface Props {
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function OrderSummary({ lines, subtotal, deliveryFee, total }: Props) {
  return (
    <div className="bg-cream-warm/50 rounded-lg p-6 lg:p-8 border border-charcoal/5 lg:sticky lg:top-24">
      <h2 className="font-serif text-2xl tracking-tightest text-charcoal">Your order</h2>
      <ul className="mt-6 divide-y divide-charcoal/10">
        {lines.map((l) => (
          <li key={l.id} className="py-4 flex gap-4 items-center">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-cream">
              {l.image_url && (
                <Image src={l.image_url} alt={l.name} fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] text-charcoal leading-tight">
                <span className="text-charcoal/50 mr-1.5">{l.qty}×</span>
                {l.name}
              </p>
              <p className="text-[12.5px] text-charcoal/50 mt-0.5">{formatUSD(l.price)} each</p>
            </div>
            <span className="font-serif text-[15px] text-charcoal shrink-0 tabular-nums">
              {formatUSD(l.qty * l.price)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-charcoal/10 mt-2 pt-5 space-y-2.5 text-[14.5px]">
        <Row label="Subtotal" value={formatUSD(subtotal)} />
        <Row
          label="Delivery"
          value={deliveryFee > 0 ? formatUSD(deliveryFee) : 'Free'}
          muted={deliveryFee === 0}
        />
      </div>
      <div className="border-t border-charcoal/10 mt-4 pt-4 flex items-baseline justify-between">
        <span className="text-charcoal/70 text-sm">Total</span>
        <span className="font-serif text-2xl text-forest tabular-nums">{formatUSD(total)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal/60">{label}</span>
      <span className={muted ? 'text-charcoal/50' : 'text-charcoal'}>{value}</span>
    </div>
  );
}
