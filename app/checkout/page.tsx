import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CheckoutV2 } from '@/components/checkout/checkout-v2';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import type { SavedAddress } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  let userProfile: { name: string | null; phone: string | null } | null = null;
  let addresses: SavedAddress[] = [];

  if (user) {
    const supabase = supabaseServer();
    const [{ data: customer }, { data: addrs }] = await Promise.all([
      supabase.from('customers').select('full_name, phone').eq('id', user.id).single(),
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true }),
    ]);
    userProfile = customer ? { name: customer.full_name, phone: customer.phone } : { name: null, phone: user.phone ?? null };
    addresses = (addrs ?? []) as SavedAddress[];
  }

  return (
    <>
      <Header />
      <main className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <CheckoutV2 initialUser={userProfile} savedAddresses={addresses} />
        </div>
      </main>
      <Footer />
    </>
  );
}
