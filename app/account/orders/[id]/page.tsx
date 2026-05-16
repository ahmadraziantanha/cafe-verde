import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { OrderTracker } from '@/components/account/order-tracker';
import type { Order } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order tracking', robots: { index: false, follow: false } };

export default async function OrderTrackingPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single<Order>();

  if (!data) notFound();
  return <OrderTracker initial={data} />;
}
