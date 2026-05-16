import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

export function AboutSection() {
  return (
    <section id="about" className="py-28 lg:py-40 scroll-mt-20 bg-cream-warm/40">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
        <Reveal className="lg:col-span-6 order-2 lg:order-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] shadow-[0_30px_60px_-30px_rgba(20,30,24,0.3)]">
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=85&auto=format&fit=crop"
              alt="Warmly lit cafe interior with wooden tables and plants"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-6 lg:pl-6 order-1 lg:order-2">
          <p className="eyebrow text-forest">Our story</p>
          <h2 className="font-serif text-4xl lg:text-6xl tracking-tightest text-charcoal mt-5 leading-[1.02]">
            A small cafe with a <span className="italic font-light">careful hand.</span>
          </h2>
          <div className="space-y-5 mt-10 text-charcoal/70 leading-[1.85] text-[15px]">
            <p>
              Cafe Verde began with a simple idea — that a cup of coffee and a warm croissant, made well and served
              without fuss, can change the shape of a morning.
            </p>
            <p>
              We source our beans from independent roasters, bake pastries on site each day, and cook everything to order.
              No shortcuts, no hurry.
            </p>
          </div>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 mt-12 text-sm text-forest border-b border-forest/30 hover:border-forest pb-1 transition-colors"
          >
            Visit us
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
