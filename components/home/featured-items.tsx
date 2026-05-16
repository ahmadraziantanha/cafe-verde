import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabasePublic } from '@/lib/supabase/server';
import { formatUSD } from '@/lib/format';
import type { MenuItem } from '@/lib/supabase/types';
import { Reveal } from '@/components/ui/reveal';

const FEATURED_NAMES = ['Cappuccino', 'Butter Croissant', 'Avocado Toast'];

async function getFeatured(): Promise<MenuItem[]> {
  try {
    const { data } = await supabasePublic()
      .from('menu_items')
      .select('*')
      .in('name', FEATURED_NAMES)
      .eq('available', true);
    if (!data) return [];
    return FEATURED_NAMES
      .map((n) => data.find((d: MenuItem) => d.name === n))
      .filter(Boolean) as MenuItem[];
  } catch {
    return [];
  }
}

export async function FeaturedItems() {
  const items = await getFeatured();

  return (
    <section className="py-28 lg:py-40 bg-cream">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16 lg:mb-20">
            <div className="max-w-xl">
              <p className="eyebrow text-forest">Featured</p>
              <h2 className="font-serif text-4xl lg:text-6xl tracking-tightest text-charcoal mt-5 leading-[1.02]">
                A few of our <span className="italic font-light">favourites</span>
              </h2>
            </div>
            <Link
              href="/menu"
              className="hidden md:inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-forest border-b border-charcoal/20 hover:border-forest pb-1 transition-colors"
            >
              See full menu
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        {items.length === 0 ? (
          <p className="text-charcoal/50 text-sm">Menu loading soon — please check back.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {items.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 0.1}>
                <article className="group transition-all duration-500 ease-out hover:-translate-y-2">
                  <Link href="/menu" className="block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-cream-warm shadow-[0_1px_2px_rgba(20,30,24,0.04)] transition-shadow duration-500 group-hover:shadow-[0_40px_70px_-30px_rgba(20,30,24,0.4),0_15px_30px_-18px_rgba(20,30,24,0.2)]">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 33vw, 100vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="pt-7 flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl lg:text-[26px] text-charcoal leading-[1.15] tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-charcoal/55 text-[13.5px] mt-2 leading-[1.65] max-w-[36ch]">
                          {item.description}
                        </p>
                      </div>
                      <span className="font-serif text-[17px] text-forest shrink-0 tabular-nums">
                        {formatUSD(item.price)}
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="md:hidden mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-forest border-b border-forest/30 pb-1"
          >
            See full menu <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
