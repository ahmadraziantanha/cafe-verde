import { requireUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { AddressManager } from '@/components/account/address-manager';
import type { SavedAddress } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Addresses', robots: { index: false, follow: false } };

export default async function AddressesPage() {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  const addresses = (data ?? []) as SavedAddress[];

  return <AddressManager initial={addresses} userId={user.id} />;
}
