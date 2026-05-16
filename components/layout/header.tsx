'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { supabaseBrowser } from '@/lib/supabase/client';
import { CartDrawer } from './cart-drawer';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const itemCount = useCart((s) => s.itemCount());

  useEffect(() => {
    setMounted(true);
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setSignedIn(!!session?.user);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const count = mounted ? itemCount : 0;

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 leading-none group">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-cream font-serif italic text-[22px] leading-none pb-0.5 shadow-[0_1px_2px_rgba(20,30,24,0.12)] transition-transform group-hover:-translate-y-px"
          >
            V
          </span>
          <span className="font-serif text-2xl lg:text-[26px] tracking-tightest text-forest">
            Cafe Verde
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm text-charcoal/80">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn('nav-link', pathname === n.href && 'active text-charcoal')}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {mounted && (
            <Link
              href={signedIn ? '/account' : '/login'}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-charcoal hover:bg-charcoal/5 transition-colors"
              aria-label={signedIn ? 'Account' : 'Sign in'}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </Link>
          )}

          <CartDrawer>
            <button
              type="button"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-full text-charcoal hover:bg-charcoal/5 transition-colors"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-forest text-cream text-[10px] font-medium flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </CartDrawer>

          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-2 bg-forest text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-forest-deep transition-all hover:-translate-y-px ml-1"
          >
            Order Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-charcoal"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-charcoal/10 bg-cream animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-3 text-charcoal text-base border-b border-charcoal/5"
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={signedIn ? '/account' : '/login'}
              className="py-3 text-charcoal text-base border-b border-charcoal/5"
              onClick={() => setMobileOpen(false)}
            >
              {signedIn ? 'My account' : 'Sign in'}
            </Link>
            <Link
              href="/menu"
              onClick={() => setMobileOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-forest text-cream px-5 py-3.5 rounded-full text-sm font-medium"
            >
              Order Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
