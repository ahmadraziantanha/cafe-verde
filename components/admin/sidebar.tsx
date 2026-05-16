'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ClipboardList, UtensilsCrossed, ExternalLink, LogOut } from 'lucide-react';
import { LogoutButton } from './logout-button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Orders', icon: ClipboardList, match: (p: string) => p === '/admin' },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, match: (p: string) => p.startsWith('/admin/menu') },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-white border-r border-slate-200/70 h-screen sticky top-0">
      <Link href="/admin" className="flex items-center gap-2.5 px-6 h-[68px] border-b border-slate-200/70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-cream">
          <Coffee className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-[17px] text-charcoal tracking-tightest">Cafe Verde</p>
          <p className="text-[10.5px] text-slate-500 uppercase tracking-[0.18em] font-medium">Admin</p>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 pb-2 text-[10.5px] font-semibold text-slate-400 uppercase tracking-[0.16em]">Workspace</p>
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors',
                active
                  ? 'bg-forest/[0.08] text-forest'
                  : 'text-slate-600 hover:text-charcoal hover:bg-slate-50',
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-forest' : 'text-slate-400 group-hover:text-slate-600')} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/70 p-3 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:text-charcoal hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
          View site
        </Link>
        <LogoutButton className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:text-charcoal hover:bg-slate-50 transition-colors">
          <LogOut className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
          Sign out
        </LogoutButton>
      </div>
    </aside>
  );
}

export function AdminTopbar() {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200/70 h-[60px] flex items-center justify-between px-5">
      <Link href="/admin" className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-forest text-cream">
          <Coffee className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="font-serif text-[16px] text-charcoal tracking-tightest">Cafe Verde Admin</p>
      </Link>
      <nav className="flex items-center gap-4 text-[13px] text-slate-600">
        <Link href="/admin" className="hover:text-forest">Orders</Link>
        <Link href="/admin/menu" className="hover:text-forest">Menu</Link>
      </nav>
    </header>
  );
}
