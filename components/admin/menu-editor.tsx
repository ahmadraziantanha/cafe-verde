'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Loader2, X, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatUSD } from '@/lib/format';
import { CATEGORIES, type MenuItem } from '@/lib/supabase/types';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  type MenuItemInput,
} from '@/actions/menu-crud';
import { cn } from '@/lib/utils';

interface Props {
  items: MenuItem[];
}

const blank: MenuItemInput = {
  name: '',
  description: '',
  price: 0,
  category: CATEGORIES[0],
  image_url: '',
  available: true,
};

const CATEGORY_BADGE: Record<string, string> = {
  Coffee: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  Pastries: 'bg-rose-50 text-rose-800 ring-rose-600/15',
  Breakfast: 'bg-orange-50 text-orange-800 ring-orange-600/15',
  Lunch: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
  'Cold Drinks': 'bg-sky-50 text-sky-800 ring-sky-600/15',
};

export function MenuEditor({ items }: Props) {
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<'all' | (typeof CATEGORIES)[number]>('all');

  const visible = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const available = items.filter((i) => i.available).length;

  function onToggle(item: MenuItem) {
    startTransition(async () => {
      const res = await toggleAvailability(item.id, !item.available);
      if (!res.ok) toast.error(res.error ?? 'Could not update.');
      else toast.success(item.available ? `${item.name} hidden` : `${item.name} shown`);
    });
  }

  function onDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteMenuItem(item.id);
      if (!res.ok) toast.error(res.error ?? 'Could not delete.');
      else toast.success(`${item.name} deleted`);
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            All <span className="ml-1.5 text-slate-400 tabular-nums">{items.length}</span>
          </FilterPill>
          {CATEGORIES.map((c) => {
            const count = items.filter((i) => i.category === c).length;
            if (count === 0) return null;
            return (
              <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
                {c} <span className="ml-1.5 text-slate-400 tabular-nums">{count}</span>
              </FilterPill>
            );
          })}
        </div>
        <Button onClick={() => setEditing('new')} className="shrink-0">
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-left text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 w-[68px]"></th>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3 text-right">Price</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-5 py-3 text-right w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((it) => (
                <tr
                  key={it.id}
                  className={cn(
                    'border-b border-slate-100 hover:bg-slate-50/50 transition-colors',
                    !it.available && 'opacity-60',
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
                      {it.image_url ? (
                        <Image src={it.image_url} alt={it.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-slate-400">
                          <ImageOff className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 max-w-[420px]">
                    <p className="font-medium text-charcoal truncate">{it.name}</p>
                    {it.description && (
                      <p className="text-[12.5px] text-slate-500 mt-0.5 line-clamp-1">{it.description}</p>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                        CATEGORY_BADGE[it.category] ?? 'bg-slate-100 text-slate-700 ring-slate-300/40',
                      )}
                    >
                      {it.category}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-charcoal tabular-nums">
                    {formatUSD(it.price)}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onToggle(it)}
                      disabled={pending}
                      role="switch"
                      aria-checked={it.available}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        it.available ? 'bg-forest' : 'bg-slate-200',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                          it.available ? 'translate-x-[18px]' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                    <span className="ml-2 text-[12.5px] text-slate-500">
                      {it.available ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setEditing(it)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-forest hover:bg-forest/5 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(it)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-sm">
                    No items in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer summary */}
      <p className="mt-4 text-[12.5px] text-slate-500">
        {available} of {items.length} items available to customers.
      </p>

      {editing && (
        <EditDialog
          initial={editing === 'new' ? blank : toInput(editing)}
          isNew={editing === 'new'}
          id={editing === 'new' ? undefined : editing.id}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-charcoal text-cream'
          : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:ring-slate-300 hover:text-charcoal',
      )}
    >
      {children}
    </button>
  );
}

function toInput(it: MenuItem): MenuItemInput {
  return {
    name: it.name,
    description: it.description,
    price: it.price,
    category: it.category,
    image_url: it.image_url,
    available: it.available,
  };
}

function EditDialog({
  initial,
  isNew,
  id,
  onClose,
}: {
  initial: MenuItemInput;
  isNew: boolean;
  id?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MenuItemInput>(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = isNew ? await createMenuItem(form) : await updateMenuItem(id!, form);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? 'Could not save.');
      return;
    }
    toast.success(isNew ? 'Item added' : 'Item updated');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg p-7 shadow-2xl relative ring-1 ring-slate-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-charcoal rounded-md hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-2xl tracking-tightest text-charcoal">
          {isNew ? 'Add menu item' : 'Edit item'}
        </h3>
        <p className="text-[13px] text-slate-500 mt-1">Changes go live immediately for all customers.</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              placeholder="https://images.unsplash.com/…"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="h-4 w-4 accent-forest"
            />
            Available to customers
          </label>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
