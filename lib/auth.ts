import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase/server';

export async function getCurrentUser() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
