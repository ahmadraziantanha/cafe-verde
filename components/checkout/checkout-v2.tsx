'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ArrowRight, Loader2, Lock, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useCart } from '@/lib/cart-store';
import { formatUSD, formatPhoneUS, toE164US } from '@/lib/format';
import { lookupPromo, type PromoApplied } from '@/lib/promo';
import { US_STATES, type SavedAddress } from '@/lib/supabase/types';
import { placeOrder } from '@/actions/place-order';
import { cn } from '@/lib/utils';

const DELIVERY_FEE = 3.99;

type Section = 'contact' | 'delivery' | 'schedule' | 'payment' | 'review';
const SECTIONS: { id: Section; n: number; label: string }[] = [
  { id: 'contact',  n: 1, label: 'Contact' },
  { id: 'delivery', n: 2, label: 'Delivery' },
  { id: 'schedule', n: 3, label: 'When' },
  { id: 'payment',  n: 4, label: 'Payment' },
  { id: 'review',   n: 5, label: 'Review & place order' },
];

const contactSchema = z.object({
  customer_name: z.string().min(2, 'Enter your name.'),
  phone:         z.string().refine((v) => !!toE164US(v), 'Enter a valid 10-digit US phone.'),
});

const addressSchema = z.object({
  street: z.string().min(2, 'Street required.'),
  apt:    z.string().optional(),
  city:   z.string().min(1, 'City required.'),
  state:  z.string().length(2, 'State required.'),
  zip:    z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 digits.'),
  instructions: z.string().optional(),
});

interface Props {
  initialUser: { name: string | null; phone: string | null } | null;
  savedAddresses: SavedAddress[];
}

export function CheckoutV2({ initialUser, savedAddresses }: Props) {
  const router = useRouter();
  const _lines = useCart((s) => s.lines);
  const _cartSubtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);

  // Gate cart values on `mounted` so SSR and first client render match
  // (Zustand persist hydrates from localStorage synchronously on mount).
  const lines = mounted ? _lines : [];
  const cartSubtotal = mounted ? _cartSubtotal : 0;

  const [active, setActive] = useState<Section>('contact');
  const [doneSections, setDoneSections] = useState<Set<Section>>(new Set());

  // ---------- Contact ----------
  const [contact, setContact] = useState({
    customer_name: initialUser?.name ?? '',
    phone:         initialUser?.phone ? formatPhoneUS(initialUser.phone) : '',
  });

  // ---------- Delivery ----------
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const defaultAddr = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddr?.id ?? null);
  const [usingNewAddress, setUsingNewAddress] = useState(savedAddresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    street: '', apt: '', city: '', state: 'NY', zip: '', instructions: '',
  });

  // ---------- Schedule ----------
  const [schedule, setSchedule] = useState<'asap' | string>('asap');

  // ---------- Payment ----------
  // COD only for now. Card option is shown but disabled.
  const paymentMethod = 'cod';

  // ---------- Promo ----------
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoApplied | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // ---------- Order notes ----------
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  // Re-evaluate promo when subtotal changes.
  useEffect(() => {
    if (!promo) return;
    const next = lookupPromo(promo.code, cartSubtotal);
    setPromo(next);
  }, [cartSubtotal]);

  const deliveryFee = orderType === 'delivery' && lines.length > 0 ? DELIVERY_FEE : 0;
  const discount = promo?.amount ?? 0;
  const total = Math.max(0, cartSubtotal - discount + deliveryFee);

  const chosenAddress = useMemo(() => {
    if (orderType !== 'delivery') return null;
    if (!usingNewAddress && selectedAddressId) {
      const s = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!s) return null;
      return { street: s.street, apt: s.apt ?? '', city: s.city, state: s.state, zip: s.zip, instructions: s.instructions ?? '' };
    }
    return newAddress;
  }, [orderType, usingNewAddress, selectedAddressId, newAddress, savedAddresses]);

  function markDone(s: Section, next: Section) {
    setDoneSections((d) => new Set(d).add(s));
    setActive(next);
  }

  // ---------- Section handlers ----------
  function commitContact() {
    const r = contactSchema.safeParse(contact);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    markDone('contact', 'delivery');
  }

  function commitDelivery() {
    if (orderType === 'delivery') {
      const r = addressSchema.safeParse(chosenAddress);
      if (!r.success) {
        toast.error(r.error.issues[0].message);
        return;
      }
    }
    markDone('delivery', 'schedule');
  }

  function commitSchedule() {
    markDone('schedule', 'payment');
  }

  function commitPayment() {
    markDone('payment', 'review');
  }

  function applyPromo() {
    const result = lookupPromo(promoInput, cartSubtotal);
    if (!result) {
      setPromoError('That code is not valid.');
      setPromo(null);
      return;
    }
    setPromo(result);
    setPromoError(null);
    toast.success(`${result.label} applied`);
  }

  function clearPromo() {
    setPromo(null);
    setPromoInput('');
  }

  async function placeOrderNow() {
    if (lines.length === 0) return;
    setSubmitting(true);
    const phoneE164 = toE164US(contact.phone)!;
    const res = await placeOrder({
      customer_name: contact.customer_name.trim(),
      phone: phoneE164,
      order_type: orderType,
      address: orderType === 'delivery' ? {
        street: chosenAddress!.street.trim(),
        apt: chosenAddress!.apt?.trim() || null,
        city: chosenAddress!.city.trim(),
        state: chosenAddress!.state,
        zip: chosenAddress!.zip.trim(),
        instructions: chosenAddress!.instructions?.trim() || null,
      } : null,
      items: lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price })),
      notes: notes.trim() || null,
      promo_code: promo?.code ?? null,
      scheduled_for: null,
    });

    if (!res.ok || !res.orderId) {
      toast.error(res.error ?? 'Could not place order.');
      setSubmitting(false);
      return;
    }
    clear();
    router.push(`/order-confirmed?ref=${encodeURIComponent(res.shortRef!)}&id=${encodeURIComponent(res.orderId)}`);
  }

  // ---------- Empty cart ----------
  if (mounted && lines.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="eyebrow text-forest">Bag</p>
        <h1 className="font-serif text-4xl tracking-tightest text-charcoal mt-4">Your bag is empty</h1>
        <p className="text-charcoal/60 mt-4">Add a few things from the menu before checking out.</p>
        <Button asChild className="mt-8">
          <Link href="/menu">Browse menu <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  const isDone = (s: Section) => doneSections.has(s);

  return (
    <div>
      <p className="eyebrow text-forest">Checkout</p>
      <h1 className="font-serif text-4xl lg:text-5xl tracking-tightest text-charcoal mt-3">Almost there.</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 mt-10 items-start">

        {/* LEFT: collapsing sections */}
        <div className="space-y-5">

          {/* 1. Contact */}
          <SectionCard
            section={SECTIONS[0]}
            state={active === 'contact' ? 'active' : isDone('contact') ? 'done' : 'pending'}
            summary={`${contact.customer_name || '—'} · ${contact.phone || ''}`}
            onEdit={() => setActive('contact')}
          >
            {!initialUser && (
              <div className="bg-cream-warm/60 border border-charcoal/10 rounded-md p-4 mb-5 flex items-start gap-3">
                <Lock className="h-4 w-4 text-forest mt-0.5 shrink-0" strokeWidth={1.6} />
                <div className="flex-1 text-sm">
                  <p className="text-charcoal">
                    Have an account?{' '}
                    <Link href={`/login?next=/checkout`} className="text-forest underline-offset-2 hover:underline">Sign in</Link>{' '}
                    to pull saved addresses, or continue as guest.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={contact.customer_name}
                  onChange={(e) => setContact({ ...contact, customer_name: e.target.value })}
                  placeholder="Ahmad"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="(917) 555-0142"
                  autoComplete="tel"
                />
              </div>
            </div>
            <Button onClick={commitContact} className="mt-6">Continue <ArrowRight className="h-4 w-4" /></Button>
          </SectionCard>

          {/* 2. Delivery */}
          <SectionCard
            section={SECTIONS[1]}
            state={active === 'delivery' ? 'active' : isDone('delivery') ? 'done' : 'pending'}
            summary={
              orderType === 'pickup'
                ? 'Pickup · 247 Bedford Ave, Brooklyn'
                : chosenAddress?.street
                  ? `Delivery · ${chosenAddress.street}${chosenAddress.apt ? ', ' + chosenAddress.apt : ''}, ${chosenAddress.city}`
                  : 'Delivery'
            }
            onEdit={() => setActive('delivery')}
            locked={!isDone('contact')}
          >
            <div className="grid grid-cols-2 gap-3 mb-6">
              <PillRadio
                selected={orderType === 'pickup'}
                onSelect={() => setOrderType('pickup')}
                label="Pickup"
                desc="Ready in ~15 min · Free"
              />
              <PillRadio
                selected={orderType === 'delivery'}
                onSelect={() => setOrderType('delivery')}
                label="Delivery"
                desc={`30–45 min · ${formatUSD(DELIVERY_FEE)}`}
              />
            </div>

            {orderType === 'delivery' && (
              <>
                {savedAddresses.length > 0 && (
                  <div className="mb-5">
                    <p className="eyebrow text-charcoal/45 mb-3">Saved addresses</p>
                    <div className="space-y-2">
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setSelectedAddressId(a.id); setUsingNewAddress(false); }}
                          className={cn(
                            'w-full text-left rounded-md border p-3 flex items-start gap-3 transition-colors',
                            !usingNewAddress && selectedAddressId === a.id
                              ? 'border-forest bg-forest/[0.03]'
                              : 'border-charcoal/15 hover:border-charcoal/30',
                          )}
                        >
                          <span className={cn(
                            'mt-1 h-4 w-4 rounded-full border-2 shrink-0',
                            !usingNewAddress && selectedAddressId === a.id ? 'border-forest' : 'border-charcoal/25',
                          )}>
                            {!usingNewAddress && selectedAddressId === a.id && (
                              <span className="block w-2 h-2 m-[3px] rounded-full bg-forest" />
                            )}
                          </span>
                          <div>
                            <p className="text-[14.5px] text-charcoal">
                              <span className="font-medium">{a.label}</span>
                              {a.is_default && <span className="ml-2 text-[11px] text-forest">Default</span>}
                            </p>
                            <p className="text-[13px] text-charcoal/60 mt-0.5">
                              {a.street}{a.apt ? `, ${a.apt}` : ''}, {a.city}, {a.state} {a.zip}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setUsingNewAddress(true); setSelectedAddressId(null); }}
                        className={cn(
                          'w-full text-left rounded-md border border-dashed p-3 text-sm transition-colors',
                          usingNewAddress ? 'border-forest text-forest bg-forest/[0.03]' : 'border-charcoal/20 text-charcoal/60 hover:border-charcoal/40',
                        )}
                      >
                        + Use a new address
                      </button>
                    </div>
                  </div>
                )}

                {usingNewAddress && (
                  <>
                    <p className="eyebrow text-charcoal/45 mb-3">Delivery address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                      <div className="sm:col-span-6 space-y-2">
                        <Label>Street address</Label>
                        <Input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} autoComplete="address-line1" />
                      </div>
                      <div className="sm:col-span-3 space-y-2">
                        <Label>Apt / Suite (optional)</Label>
                        <Input value={newAddress.apt} onChange={(e) => setNewAddress({ ...newAddress, apt: e.target.value })} placeholder="3B" autoComplete="address-line2" />
                      </div>
                      <div className="sm:col-span-3 space-y-2">
                        <Label>City</Label>
                        <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} autoComplete="address-level2" />
                      </div>
                      <div className="sm:col-span-3 space-y-2">
                        <Label>State</Label>
                        <Select value={newAddress.state} onValueChange={(v) => setNewAddress({ ...newAddress, state: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-3 space-y-2">
                        <Label>ZIP code</Label>
                        <Input value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value.replace(/[^\d-]/g, '').slice(0, 10) })} placeholder="11211" inputMode="numeric" autoComplete="postal-code" />
                      </div>
                      <div className="sm:col-span-6 space-y-2">
                        <Label>Delivery instructions (optional)</Label>
                        <Textarea value={newAddress.instructions} onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })} placeholder="Gate code, where to leave the bag…" />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Button onClick={commitDelivery} className="mt-6">Continue <ArrowRight className="h-4 w-4" /></Button>
          </SectionCard>

          {/* 3. Schedule */}
          <SectionCard
            section={SECTIONS[2]}
            state={active === 'schedule' ? 'active' : isDone('schedule') ? 'done' : 'pending'}
            summary={schedule === 'asap' ? 'As soon as possible' : `Scheduled · ${schedule}`}
            onEdit={() => setActive('schedule')}
            locked={!isDone('delivery')}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['asap', '+15 min', '+30 min', '+45 min'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSchedule(opt)}
                  className={cn(
                    'px-3 py-3 rounded-md border text-sm transition-colors',
                    schedule === opt ? 'border-forest bg-forest/[0.03] text-forest' : 'border-charcoal/15 text-charcoal/70 hover:border-charcoal/30',
                  )}
                >
                  {opt === 'asap' ? 'ASAP' : opt}
                </button>
              ))}
            </div>
            <Button onClick={commitSchedule} className="mt-6">Continue <ArrowRight className="h-4 w-4" /></Button>
          </SectionCard>

          {/* 4. Payment */}
          <SectionCard
            section={SECTIONS[3]}
            state={active === 'payment' ? 'active' : isDone('payment') ? 'done' : 'pending'}
            summary={`Cash on ${orderType === 'pickup' ? 'pickup' : 'delivery'}`}
            onEdit={() => setActive('payment')}
            locked={!isDone('schedule')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PillRadio
                selected
                onSelect={() => {}}
                label={`Cash on ${orderType === 'pickup' ? 'pickup' : 'delivery'}`}
                desc="Pay the barista or driver"
                Icon={Banknote}
              />
              <button
                type="button"
                disabled
                className="text-left rounded-lg border border-dashed border-charcoal/15 p-4 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" strokeWidth={1.5} />
                  <span className="text-[14.5px] font-medium text-charcoal">Card</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">Coming soon</p>
              </button>
            </div>
            <Button onClick={commitPayment} className="mt-6">Continue <ArrowRight className="h-4 w-4" /></Button>
          </SectionCard>

          {/* 5. Review */}
          <SectionCard
            section={SECTIONS[4]}
            state={active === 'review' ? 'active' : isDone('review') ? 'done' : 'pending'}
            summary="One last look before we start brewing"
            locked={!isDone('payment')}
            hideEdit
          >
            <div className="space-y-3 text-sm">
              <ReviewRow label="Contact" value={`${contact.customer_name} · ${contact.phone}`} />
              <ReviewRow
                label={orderType === 'pickup' ? 'Pickup' : 'Delivery'}
                value={
                  orderType === 'pickup'
                    ? '247 Bedford Ave, Brooklyn, NY'
                    : chosenAddress
                      ? `${chosenAddress.street}${chosenAddress.apt ? ', ' + chosenAddress.apt : ''}, ${chosenAddress.city}, ${chosenAddress.state} ${chosenAddress.zip}`
                      : ''
                }
              />
              <ReviewRow label="When" value={schedule === 'asap' ? 'ASAP' : schedule} />
              <ReviewRow label="Payment" value={`Cash on ${orderType === 'pickup' ? 'pickup' : 'delivery'}`} />
            </div>

            <div className="mt-6 space-y-2">
              <Label>Notes for the kitchen (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, preferences…"
              />
            </div>

            <Button
              size="lg"
              onClick={placeOrderNow}
              disabled={submitting}
              className="w-full sm:w-auto mt-7"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : <>Place order · {formatUSD(total)} <ArrowRight className="h-4 w-4" /></>}
            </Button>

            <p className="text-xs text-charcoal/50 mt-4 leading-relaxed">
              By placing your order you agree to our terms. Pay the barista or driver in cash on arrival — no card needed.
            </p>
          </SectionCard>
        </div>

        {/* RIGHT: order summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="bg-cream-warm/50 border border-charcoal/10 rounded-xl p-6">
            <h3 className="font-serif text-xl tracking-tightest text-charcoal">Your order</h3>

            <ul className="mt-5 divide-y divide-charcoal/10">
              {lines.map((l) => (
                <li key={l.id} className="py-3.5 flex gap-3 items-center">
                  <div className="relative h-14 w-14 rounded-md overflow-hidden shrink-0 bg-cream">
                    {l.image_url && <Image src={l.image_url} alt={l.name} fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-charcoal truncate">
                      <span className="text-charcoal/50 mr-1">{l.qty}×</span>{l.name}
                    </p>
                    <p className="text-[12px] text-charcoal/50 mt-0.5">{formatUSD(l.price)} each</p>
                  </div>
                  <span className="font-serif text-[15px] text-charcoal tabular-nums shrink-0">{formatUSD(l.qty * l.price)}</span>
                </li>
              ))}
            </ul>

            {/* Promo code */}
            <div className="mt-4 pt-4 border-t border-charcoal/10">
              {promo ? (
                <div className="flex items-center justify-between bg-forest/[0.06] border border-forest/20 rounded-md px-3 py-2">
                  <div>
                    <p className="text-[13px] text-forest font-medium">{promo.code}</p>
                    <p className="text-[11px] text-charcoal/55">{promo.label}</p>
                  </div>
                  <button type="button" onClick={clearPromo} className="text-xs text-charcoal/55 hover:text-red-700">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                      placeholder="Promo code"
                      className="h-10 uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="px-4 text-sm text-forest border border-forest/30 rounded-md hover:bg-forest/5 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-700 mt-1.5">{promoError}</p>}
                  <p className="text-[11px] text-charcoal/40 mt-2">Try <span className="font-mono">VERDE10</span> for 10% off.</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-charcoal/10 space-y-2 text-[14px]">
              <Row label="Subtotal" value={formatUSD(cartSubtotal)} />
              {discount > 0 && <Row label={`Promo ${promo?.code ?? ''}`} value={`−${formatUSD(discount)}`} accent />}
              <Row label="Delivery" value={deliveryFee > 0 ? formatUSD(deliveryFee) : 'Free'} muted={deliveryFee === 0} />
            </div>
            <div className="mt-4 pt-4 border-t border-charcoal/10 flex items-baseline justify-between">
              <span className="text-charcoal/70 text-sm">Total</span>
              <span className="font-serif text-2xl text-forest tabular-nums">{formatUSD(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// SectionCard — collapsing wrapper for each checkout step
// ============================================================
interface SectionCardProps {
  section: { id: Section; n: number; label: string };
  state: 'pending' | 'active' | 'done';
  summary: string;
  onEdit?: () => void;
  locked?: boolean;
  hideEdit?: boolean;
  children: React.ReactNode;
}

function SectionCard({ section, state, summary, onEdit, locked, hideEdit, children }: SectionCardProps) {
  if (state === 'active') {
    return (
      <section className="bg-white rounded-xl border border-forest/40 shadow-[0_1px_0_rgba(45,95,63,.05),0_12px_28px_-20px_rgba(45,95,63,.25)] p-6 lg:p-7">
        <div className="flex items-center gap-4 mb-6">
          <StepBadge state="active" n={section.n} />
          <div>
            <p className="text-[11px] uppercase tracking-[.18em] text-charcoal/55 font-medium">{section.label}</p>
          </div>
        </div>
        {children}
      </section>
    );
  }
  return (
    <section className={cn(
      'rounded-xl border px-6 py-5 flex items-center justify-between gap-4 transition-colors',
      state === 'done' ? 'bg-cream-warm/40 border-charcoal/10' : 'bg-white border-charcoal/10',
      locked && 'opacity-50',
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <StepBadge state={state} n={section.n} />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[.18em] text-charcoal/45 font-medium">
            {section.n} · {section.label}
          </p>
          <p className={cn('text-[14.5px] truncate mt-0.5', state === 'done' ? 'text-charcoal' : 'text-charcoal/50')}>{summary}</p>
        </div>
      </div>
      {state === 'done' && !hideEdit && onEdit && (
        <button onClick={onEdit} className="text-sm text-charcoal/65 hover:text-forest hover:underline shrink-0">
          Edit
        </button>
      )}
      {state === 'pending' && !locked && (
        <ChevronRight className="h-4 w-4 text-charcoal/30 shrink-0" />
      )}
    </section>
  );
}

function StepBadge({ state, n }: { state: 'pending' | 'active' | 'done'; n: number }) {
  return (
    <span className={cn(
      'w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-medium shrink-0',
      state === 'done' && 'bg-forest text-cream',
      state === 'active' && 'bg-forest text-cream',
      state === 'pending' && 'bg-charcoal/8 text-charcoal/50',
    )}>
      {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : n}
    </span>
  );
}

function PillRadio({
  selected, onSelect, label, desc, Icon,
}: { selected: boolean; onSelect: () => void; label: string; desc: string; Icon?: import('lucide-react').LucideIcon }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'text-left rounded-lg border p-4 flex gap-3 items-start transition-colors',
        selected ? 'border-forest bg-forest/[0.03]' : 'border-charcoal/15 hover:border-charcoal/30',
      )}
    >
      <span className={cn(
        'mt-1 h-4 w-4 rounded-full border-2 shrink-0 relative',
        selected ? 'border-forest' : 'border-charcoal/25',
      )}>
        {selected && <span className="absolute inset-[3px] rounded-full bg-forest" />}
      </span>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" strokeWidth={1.6} />}
          <p className="text-[14.5px] font-medium text-charcoal">{label}</p>
        </div>
        <p className="text-xs text-charcoal/55 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal/60">{label}</span>
      <span className={cn('tabular-nums', accent && 'text-forest', muted && 'text-charcoal/50', !accent && !muted && 'text-charcoal')}>{value}</span>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-charcoal/5 last:border-0">
      <span className="text-charcoal/55 shrink-0">{label}</span>
      <span className="text-charcoal text-right">{value}</span>
    </div>
  );
}
