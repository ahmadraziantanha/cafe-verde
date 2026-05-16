import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CategoryNav } from '@/components/menu/category-nav';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { supabasePublic } from '@/lib/supabase/server';
import { CATEGORIES, type MenuItem, type Category } from '@/lib/supabase/types';

export const revalidate = 60;
export const metadata = {
  title: 'Menu',
  description: 'Specialty coffee, pastries baked on site, all-day breakfast and lunch.',
};

async function getMenu(): Promise<MenuItem[]> {
  try {
    const { data } = await supabasePublic()
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: true });
    return (data ?? []) as MenuItem[];
  } catch {
    return [];
  }
}

function slugify(s: string) {
  return 'cat-' + s.toLowerCase().replace(/\s+/g, '-');
}

export default async function MenuPage() {
  const items = await getMenu();

  // Only show categories that actually have items
  const present = CATEGORIES.filter((c) => items.some((i) => i.category === c));
  const byCategory: Record<Category, MenuItem[]> = CATEGORIES.reduce((acc, c) => {
    acc[c] = items.filter((i) => i.category === c);
    return acc;
  }, {} as Record<Category, MenuItem[]>);

  return (
    <>
      <Header />
      <main className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24">
          <p className="eyebrow text-forest">Menu</p>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tightest text-charcoal mt-3 leading-[0.95]">
            Today&rsquo;s menu
          </h1>
          <p className="text-charcoal/60 mt-6 max-w-xl text-[15.5px] leading-relaxed">
            Made each morning, served all day. Order ahead for pickup or delivery.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">
          <CategoryNav categories={present} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-12 lg:mt-16 space-y-20 lg:space-y-24">
          {present.map((cat) => (
            <section key={cat} id={slugify(cat)} className="scroll-mt-40">
              <div className="flex items-baseline justify-between mb-8 lg:mb-10">
                <h2 className="font-serif text-3xl lg:text-4xl tracking-tightest text-charcoal">{cat}</h2>
                <span className="text-xs text-charcoal/40 tabular-nums">
                  {byCategory[cat].length} {byCategory[cat].length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                {byCategory[cat].map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}

          {present.length === 0 && (
            <div className="text-center py-24">
              <p className="font-serif text-2xl text-charcoal/70">The menu is being prepared.</p>
              <p className="text-sm text-charcoal/50 mt-2">
                Run the SQL migration and seed file in Supabase to populate items.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
