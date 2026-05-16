'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/supabase/types';

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!isAdmin()) return { ok: false, error: 'Unauthorized' };
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: 'Invalid status' };

  const { error } = await supabaseAdmin()
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin');
  return { ok: true };
}
