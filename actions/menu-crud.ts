'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/supabase/types';

const menuItemSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).default(''),
  price: z.number().nonnegative(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  image_url: z.string().url().or(z.literal('')),
  available: z.boolean().default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

function guard() {
  if (!isAdmin()) throw new Error('Unauthorized');
}

function revalidate() {
  revalidatePath('/');
  revalidatePath('/menu');
  revalidatePath('/admin/menu');
}

export async function createMenuItem(input: MenuItemInput) {
  guard();
  const data = menuItemSchema.parse(input);
  const { error } = await supabaseAdmin().from('menu_items').insert(data);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  guard();
  const data = menuItemSchema.parse(input);
  const { error } = await supabaseAdmin().from('menu_items').update(data).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteMenuItem(id: string) {
  guard();
  const { error } = await supabaseAdmin().from('menu_items').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function toggleAvailability(id: string, available: boolean) {
  guard();
  const { error } = await supabaseAdmin()
    .from('menu_items')
    .update({ available })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}
