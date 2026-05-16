'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AddressForm, type AddressFormValues } from './address-form';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { SavedAddress } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface Props {
  initial: SavedAddress[];
  userId: string;
}

export function AddressManager({ initial, userId }: Props) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(initial);
  const [editing, setEditing] = useState<SavedAddress | 'new' | null>(null);
  const [, startTransition] = useTransition();

  const supabase = supabaseBrowser();

  async function refresh() {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    setAddresses((data ?? []) as SavedAddress[]);
  }

  async function save(values: AddressFormValues, id?: string) {
    if (id) {
      const { error } = await supabase.from('addresses').update(values).eq('id', id);
      if (error) { toast.error(error.message); return false; }
      toast.success('Address updated');
    } else {
      // If first address, mark as default automatically.
      const payload = { ...values, user_id: userId, is_default: addresses.length === 0 ? true : values.is_default };
      const { error } = await supabase.from('addresses').insert(payload);
      if (error) { toast.error(error.message); return false; }
      toast.success('Address added');
    }
    await refresh();
    return true;
  }

  function remove(addr: SavedAddress) {
    if (!confirm(`Remove "${addr.label}"?`)) return;
    startTransition(async () => {
      const { error } = await supabase.from('addresses').delete().eq('id', addr.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Address removed');
      refresh();
    });
  }

  function makeDefault(addr: SavedAddress) {
    startTransition(async () => {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
      await supabase.from('addresses').update({ is_default: true }).eq('id', addr.id);
      toast.success(`${addr.label} is now your default`);
      refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-charcoal/60">{addresses.length} saved</p>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-dashed border-charcoal/15 rounded-lg p-12 text-center">
          <MapPin className="h-6 w-6 text-charcoal/30 mx-auto" strokeWidth={1.5} />
          <p className="font-serif text-xl text-charcoal/70 mt-4">No saved addresses</p>
          <p className="text-sm text-charcoal/50 mt-2">Add one to make checkout faster next time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <article key={a.id} className={cn(
              'bg-white rounded-lg border p-5 relative',
              a.is_default ? 'border-forest/40' : 'border-charcoal/10',
            )}>
              <div className="flex items-center gap-2">
                <p className="font-serif text-lg text-charcoal">{a.label}</p>
                {a.is_default && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-forest bg-forest/10 rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 fill-forest" strokeWidth={0} /> Default
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal/70 mt-2 leading-relaxed">
                {a.street}{a.apt ? `, ${a.apt}` : ''}<br />
                {a.city}, {a.state} {a.zip}
              </p>
              {a.instructions && (
                <p className="text-xs text-charcoal/50 mt-2 italic">&ldquo;{a.instructions}&rdquo;</p>
              )}
              <div className="mt-4 pt-4 border-t border-charcoal/5 flex items-center gap-3 text-xs">
                {!a.is_default && (
                  <button onClick={() => makeDefault(a)} className="text-charcoal/60 hover:text-forest">Make default</button>
                )}
                <button onClick={() => setEditing(a)} className="text-charcoal/60 hover:text-forest inline-flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => remove(a)} className="text-charcoal/60 hover:text-red-700 inline-flex items-center gap-1 ml-auto">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <AddressForm
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={async (vals) => {
            const ok = await save(vals, editing === 'new' ? undefined : editing.id);
            if (ok) setEditing(null);
          }}
        />
      )}
    </>
  );
}
