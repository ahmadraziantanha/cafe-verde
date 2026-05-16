'use server';

import { z } from 'zod';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import type { OrderAddress, OrderItem } from '@/lib/supabase/types';
import { lookupPromo } from '@/lib/promo';

const DELIVERY_FEE = 3.99;

const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  apt: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5).max(10),
  instructions: z.string().nullable().optional(),
});

const placeOrderSchema = z.object({
  customer_name: z.string().min(1).max(80),
  phone: z.string().min(6).max(30),
  order_type: z.enum(['pickup', 'delivery']),
  address: addressSchema.nullable().optional(),
  items: z.array(itemSchema).min(1),
  notes: z.string().max(500).nullable().optional(),
  promo_code: z.string().max(40).nullable().optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  shortRef?: string;
  total?: number;
  error?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid order data.' };
  }
  const data = parsed.data;

  if (data.order_type === 'delivery' && !data.address) {
    return { ok: false, error: 'Address is required for delivery.' };
  }

  // Re-fetch live prices from DB so the client can't manipulate amounts.
  const ids = data.items.map((i) => i.id);
  const { data: liveItems, error: priceErr } = await supabaseAdmin()
    .from('menu_items')
    .select('id, name, price, available')
    .in('id', ids);
  if (priceErr || !liveItems) return { ok: false, error: 'Could not validate prices.' };

  const priceMap = new Map(liveItems.map((i) => [i.id, i]));
  for (const it of data.items) {
    const live = priceMap.get(it.id);
    if (!live || !live.available) {
      return { ok: false, error: `"${it.name}" is no longer available.` };
    }
    if (Math.abs(Number(live.price) - it.price) > 0.01) {
      return { ok: false, error: 'Prices have changed. Please refresh your cart.' };
    }
  }

  // Compute totals server-side.
  const subtotal = round2(data.items.reduce((s, i) => s + i.qty * i.price, 0));
  const delivery_fee = data.order_type === 'delivery' ? DELIVERY_FEE : 0;
  const promo = data.promo_code ? lookupPromo(data.promo_code, subtotal) : null;
  const discount = promo?.amount ?? 0;
  const total = round2(Math.max(0, subtotal - discount + delivery_fee));

  // Link to current user if signed in (RLS makes this safe for guests too).
  const { data: { user } } = await supabaseServer().auth.getUser();

  const items: OrderItem[] = data.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }));
  const address: OrderAddress | null = data.address
    ? {
        street: data.address.street,
        apt: data.address.apt?.trim() || null,
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        instructions: data.address.instructions?.trim() || null,
      }
    : null;

  const { data: row, error } = await supabaseAdmin()
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      customer_name: data.customer_name.trim(),
      phone: data.phone.trim(),
      order_type: data.order_type,
      address,
      items,
      subtotal,
      delivery_fee,
      discount,
      total,
      payment_method: 'cod',
      promo_code: promo?.code ?? null,
      scheduled_for: data.scheduled_for ?? null,
      notes: data.notes?.trim() ? data.notes.trim() : null,
      status: 'new',
    })
    .select('id')
    .single();

  if (error || !row) {
    return { ok: false, error: error?.message ?? 'Could not save order.' };
  }

  // Backfill customer profile with name/phone for signed-in users (so future
  // checkouts auto-populate). Best-effort — failures are ignored.
  if (user) {
    await supabaseAdmin()
      .from('customers')
      .update({
        full_name: data.customer_name.trim(),
        phone: data.phone.trim(),
      })
      .eq('id', user.id);
  }

  return {
    ok: true,
    orderId: row.id,
    shortRef: row.id.slice(0, 8).toUpperCase(),
    total,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
