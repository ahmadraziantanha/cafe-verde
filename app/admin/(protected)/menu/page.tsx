import { MenuEditor } from '@/components/admin/menu-editor';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { MenuItem } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Menu · Admin', robots: { index: false, follow: false } };

async function getAll(): Promise<MenuItem[]> {
  const { data } = await supabaseAdmin()
    .from('menu_items')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: true });
  return (data ?? []) as MenuItem[];
}

export default async function AdminMenuPage() {
  const items = await getAll();
  return (
    <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Catalogue</p>
          <h1 className="font-serif text-3xl lg:text-[34px] tracking-tightest text-charcoal mt-1.5">Menu</h1>
          <p className="text-[13.5px] text-slate-500 mt-2">
            Add, edit, hide or remove items. Changes are live immediately.
          </p>
        </div>
      </div>
      <MenuEditor items={items} />
    </div>
  );
}
