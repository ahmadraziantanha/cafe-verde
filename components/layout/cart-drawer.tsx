'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { formatUSD } from '@/lib/format';

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => setMounted(true), []);
  const view = mounted ? lines : [];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader>
          <SheetTitle>Your bag</SheetTitle>
          <p className="text-sm text-charcoal/60">
            {view.length === 0
              ? 'Nothing here yet.'
              : `${view.reduce((n, l) => n + l.qty, 0)} item${view.reduce((n, l) => n + l.qty, 0) === 1 ? '' : 's'}`}
          </p>
        </SheetHeader>

        {view.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-cream-warm flex items-center justify-center mb-5">
              <ShoppingBag className="h-6 w-6 text-forest" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-charcoal">Your bag is empty</h3>
            <p className="text-sm text-charcoal/60 mt-2 max-w-xs">
              A coffee and a croissant make a fine morning. Go and have a look.
            </p>
            <SheetClose asChild>
              <Button asChild className="mt-8">
                <Link href="/menu">Browse menu <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-charcoal/10">
                {view.map((l) => (
                  <li key={l.id} className="py-4 flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream-warm">
                      {l.image_url && (
                        <Image
                          src={l.image_url}
                          alt={l.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-serif text-[17px] text-charcoal truncate">{l.name}</h4>
                          <p className="text-sm text-forest mt-0.5">{formatUSD(l.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(l.id)}
                          aria-label="Remove"
                          className="p-1.5 text-charcoal/40 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-charcoal/15 rounded-full">
                          <button
                            type="button"
                            onClick={() => setQty(l.id, l.qty - 1)}
                            aria-label="Decrease"
                            className="h-8 w-8 inline-flex items-center justify-center text-charcoal/70 hover:text-forest"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(l.id, l.qty + 1)}
                            aria-label="Increase"
                            className="h-8 w-8 inline-flex items-center justify-center text-charcoal/70 hover:text-forest"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-serif text-[15px] text-charcoal">
                          {formatUSD(l.qty * l.price)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-charcoal/10 px-6 py-5 space-y-4 bg-cream-warm/40">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal/70">Subtotal</span>
                <span className="font-serif text-lg text-charcoal">{formatUSD(subtotal)}</span>
              </div>
              <p className="text-xs text-charcoal/50">Delivery fee, if any, is calculated at checkout.</p>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
