'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabaseBrowser } from '@/lib/supabase/client';

interface Props {
  mode: 'signin' | 'signup';
}

export function EmailAuthForm({ mode }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/account';
  const supabase = supabaseBrowser();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      toast.error('Enter a valid email.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: mode === 'signup',
        emailRedirectTo: redirectTo,
        data: mode === 'signup' ? { full_name: fullName.trim() } : undefined,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(humanizeAuthError(error.message));
      return;
    }
    setStep('code');
    toast.success('Code sent — check your inbox.');
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.trim();
    if (token.length < 6) {
      toast.error('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    });

    if (error) {
      setLoading(false);
      toast.error(humanizeAuthError(error.message));
      return;
    }

    // On signup, set the full name on the customers row (auto-created by trigger).
    if (mode === 'signup' && fullName.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('customers')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);
      }
    }

    setLoading(false);
    toast.success(mode === 'signup' ? 'Account created.' : 'Signed in.');
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="font-serif text-2xl text-forest tracking-tightest">Cafe Verde</Link>

      {step === 'email' ? (
        <form onSubmit={sendCode} className="mt-10">
          <h1 className="font-serif text-3xl tracking-tightest text-charcoal">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-charcoal/60 mt-2">
            {mode === 'signup'
              ? 'We use your email to send order updates and to recognize you next time.'
              : 'Sign in with the email you used to order.'}
          </p>

          {mode === 'signup' && (
            <div className="mt-8 space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Ahmad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                autoFocus
                required
              />
            </div>
          )}

          <div className="mt-5 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus={mode === 'signin'}
              required
            />
            <p className="text-xs text-charcoal/50">We&rsquo;ll email you a 6-digit code.</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-7">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </Button>

          <p className="mt-6 text-sm text-charcoal/60 text-center">
            {mode === 'signup' ? (
              <>Already have an account? <Link href="/login" className="text-forest hover:underline">Sign in</Link></>
            ) : (
              <>New here? <Link href="/signup" className="text-forest hover:underline">Create an account</Link></>
            )}
          </p>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-10">
          <h1 className="font-serif text-3xl tracking-tightest text-charcoal">Check your inbox</h1>
          <p className="text-sm text-charcoal/60 mt-2">
            We sent an email to <span className="text-charcoal">{email}</span>.
            Open it and <span className="text-charcoal">click the magic link</span> to sign in.
          </p>

          <div className="mt-8 rounded-lg bg-cream-warm/60 border border-charcoal/10 p-4 text-[13px] text-charcoal/70 leading-relaxed">
            Tip: if the email contains a 6-digit code, you can paste it below instead of clicking the link.
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="code">Verification code (optional)</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.4em] font-mono"
            />
          </div>

          <Button type="submit" disabled={loading || code.length < 6} className="w-full mt-7">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : 'Verify with code'}
          </Button>

          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); }}
            className="mt-5 w-full text-sm text-charcoal/60 hover:text-forest"
          >
            ← Use a different email
          </button>
        </form>
      )}
    </div>
  );
}

function humanizeAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('rate limit')) return 'Too many attempts — wait a minute and try again.';
  if (m.includes('invalid') && (m.includes('token') || m.includes('otp'))) return 'That code is wrong or expired. Try again.';
  if (m.includes('signups not allowed') || m.includes('not allowed')) return 'Signups are disabled. Enable email auth in Supabase settings.';
  if (m.includes('user already registered')) return 'An account with this email already exists. Try signing in.';
  return msg;
}
