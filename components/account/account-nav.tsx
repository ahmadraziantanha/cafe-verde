'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, MapPin, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/account',           label: 'Overview',  Icon: User,   exact: true },
  { href: '/account/orders',    label: 'Orders',    Icon: Clock },
  { href: '/account/addresses', label: 'Addresses', Icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-6 lg:mx-0 px-6 lg:px-0 lg:sticky lg:top-24">
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-3 px-4 py-2.5 rounded-md text-sm whitespace-nowrap transition-colors',
              active ? 'bg-forest text-cream' : 'text-charcoal/70 hover:bg-charcoal/5',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-3 px-4 py-2.5 rounded-md text-sm whitespace-nowrap text-charcoal/70 hover:bg-charcoal/5 lg:mt-4"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.7} />
        Sign out
      </button>
    </nav>
  );
}
