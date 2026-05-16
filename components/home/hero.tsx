'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const rise = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 1.0, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-charcoal">
      <Image
        src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=2400&q=85&auto=format&fit=crop"
        alt="Pour-over coffee being prepared on a wooden counter"
        fill
        priority
        sizes="100vw"
        className="object-cover scale-105"
      />
      <div className="absolute inset-0 hero-overlay" />

      {/* Floating meta card — top right, asymmetric */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 1.0, ease: [0.2, 0.7, 0.2, 1] }}
        className="hidden lg:flex absolute top-28 right-10 xl:right-16 flex-col gap-3 text-cream/85 text-xs eyebrow"
      >
        <div className="h-px w-12 bg-cream/40" />
        <span>Est. 2024</span>
        <span>Brooklyn, NY</span>
        <span>Open daily · 7–21</span>
      </motion.div>

      {/* Main composition — text pinned bottom-left, headline overflows for drama */}
      <div className="relative h-full max-w-[1480px] mx-auto px-6 lg:px-12">
        <div className="absolute bottom-14 lg:bottom-20 left-6 lg:left-12 right-6 lg:right-auto lg:max-w-[68ch]">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={rise}
            className="eyebrow text-cream/85"
          >
            A neighbourhood cafe
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={rise}
            className="font-serif text-cream text-[64px] sm:text-8xl lg:text-[148px] xl:text-[168px] leading-[0.88] tracking-tightest mt-5 -ml-1"
          >
            Cafe<br />
            <span className="italic font-light text-cream/95">Verde</span>
          </motion.h1>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={rise}
            className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-8 lg:gap-14 items-end max-w-3xl"
          >
            <p className="text-cream/90 text-base lg:text-lg font-light leading-[1.65] max-w-md">
              Brewed with love, served with care — a quiet corner for considered coffee and honest food.
            </p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-cream text-forest px-7 py-3.5 rounded-full text-sm font-medium hover:bg-white transition-all hover:-translate-y-px shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
              >
                Order Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center gap-2 border border-cream/50 text-cream px-7 py-3.5 rounded-full text-sm font-medium hover:bg-cream/10 transition-all hover:-translate-y-px"
              >
                Our story
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
        className="hidden lg:flex absolute bottom-10 right-12 items-center gap-3 text-cream/60 text-xs eyebrow"
      >
        <span>Scroll</span>
        <span className="block w-12 h-px bg-cream/40 animate-pulse" />
      </motion.div>
    </section>
  );
}
