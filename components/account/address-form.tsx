'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { US_STATES, type SavedAddress } from '@/lib/supabase/types';

export interface AddressFormValues {
  label: string;
  street: string;
  apt: string | null;
  city: string;
  state: string;
  zip: string;
  instructions: string | null;
  is_default: boolean;
}

const blank: AddressFormValues = {
  label: 'Home',
  street: '',
  apt: '',
  city: '',
  state: 'NY',
  zip: '',
  instructions: '',
  is_default: false,
};

interface Props {
  initial: SavedAddress | null;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
}

export function AddressForm({ initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<AddressFormValues>(
    initial
      ? {
          label: initial.label,
          street: initial.street,
          apt: initial.apt ?? '',
          city: initial.city,
          state: initial.state,
          zip: initial.zip,
          instructions: initial.instructions ?? '',
          is_default: initial.is_default,
        }
      : blank,
  );
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim() || !form.zip.trim()) return;
    setSaving(true);
    await onSubmit({
      ...form,
      apt: form.apt?.trim() || null,
      instructions: form.instructions?.trim() || null,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        className="bg-cream rounded-lg w-full max-w-lg p-6 lg:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 text-charcoal/60 hover:text-charcoal">
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-2xl tracking-tightest text-charcoal">
          {initial ? 'Edit address' : 'Add address'}
        </h3>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <div className="flex gap-2 flex-wrap">
              {['Home', 'Work', 'Other'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, label: l })}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                    form.label === l ? 'bg-forest text-cream border-forest' : 'border-charcoal/15 text-charcoal/70 hover:border-forest'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Street address</Label>
            <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required autoComplete="address-line1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Apt / Suite</Label>
              <Input value={form.apt ?? ''} onChange={(e) => setForm({ ...form, apt: e.target.value })} placeholder="(optional)" autoComplete="address-line2" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required autoComplete="address-level2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ZIP code</Label>
              <Input
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value.replace(/[^\d-]/g, '').slice(0, 10) })}
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="11211"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delivery instructions</Label>
            <Textarea
              value={form.instructions ?? ''}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="Gate code, where to leave the bag…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-charcoal/70 pt-1">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="h-4 w-4 accent-forest"
            />
            Set as default delivery address
          </label>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
