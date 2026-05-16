import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccountNav } from '@/components/account/account-nav';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data: customer } = await supabase
    .from('customers')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  const greeting = customer?.full_name?.split(' ')[0] ?? 'there';

  return (
    <>
      <Header />
      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <p className="eyebrow text-forest">Account</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-tightest text-charcoal mt-3">
            Hi, {greeting}.
          </h1>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10 lg:gap-16 items-start">
            <AccountNav />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
