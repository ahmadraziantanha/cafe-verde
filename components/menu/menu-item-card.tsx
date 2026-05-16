'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-store';
import { formatUSD } from '@/lib/format';
import type { MenuItem } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

export function MenuItemCard({ item }: { item: MenuItem }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }, 1);
    setAdded(true);
    toast.success(`${item.name} added`, { duration: 1600 });
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative transition-all duration-500 ease-out hover:-translate-y-1.5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-cream-warm shadow-[0_1px_2px_rgba(20,30,24,0.04)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-25px_rgba(20,30,24,0.35),0_12px_24px_-15px_rgba(20,30,24,0.18)]">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          loading="lazy"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-[22px] text-charcoal leading-[1.15] tracking-tight">
            {item.name}
          </h3>
          <span className="font-serif text-[17px] text-forest shrink-0 tabular-nums">
            {formatUSD(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="text-charcoal/55 text-[13px] mt-2 leading-[1.6] max-w-[38ch]">
            {item.description}
          </p>
        )}
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium tracking-wide border rounded-full px-4 py-1.5 transition-all duration-300',
            added
              ? 'border-forest bg-forest text-cream'
              : 'border-charcoal/15 text-charcoal/80 hover:border-forest hover:text-forest hover:bg-forest/[0.03]',
          )}
          aria-label={`Add ${item.name} to cart`}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add to cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
