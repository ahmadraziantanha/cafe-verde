'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function CategoryNav({ categories }: { categories: string[] }) {
  const [active, setActive] = useState<string>(categories[0] ?? '');

  // Highlight the section currently in view
  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(slugify(c)))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(unslugify(visible.target.id));
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [categories]);

  const onClick = (c: string) => {
    const el = document.getElementById(slugify(c));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sticky top-[72px] z-30 bg-cream/90 backdrop-blur-md border-b border-charcoal/5 -mx-6 lg:-mx-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-4 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onClick(c)}
            className={cn(
              'shrink-0 whitespace-nowrap text-[13px] px-4 py-2 rounded-full border transition-colors',
              active === c
                ? 'bg-forest text-cream border-forest'
                : 'border-charcoal/15 text-charcoal/70 hover:border-forest hover:text-forest',
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function slugify(s: string) {
  return 'cat-' + s.toLowerCase().replace(/\s+/g, '-');
}
function unslugify(id: string) {
  // Reverse our slugify by category lookup is handled by caller; here we approximate.
  return id.replace(/^cat-/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
