import Link from 'next/link';
import { Check, ArrowRight, Clock, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmed' };

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: { ref?: string; id?: string };
}) {
  const ref = (searchParams.ref ?? '').slice(0, 16) || '——';
  const orderId = searchParams.id ?? null;
  const user = await getCurrentUser();

  return (
    <>
      <Header />
      <main className="flex items-center justify-center py-20 lg:py-28">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-forest text-cream flex items-center justify-center">
            <Check className="h-6 w-6" strokeWidth={2.4} />
          </div>
          <p className="eyebrow text-forest mt-8">Thank you</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-tightest text-charcoal mt-4 leading-[1.05]">
            We&rsquo;ve got your order.
          </h1>
          <p className="text-charcoal/65 mt-6 leading-relaxed">
            Pickup is usually ready in about 15 minutes; delivery in 30–45.
            You&rsquo;ll get a text when your order status changes.
          </p>

          <div className="mt-10 inline-flex flex-col items-center gap-1 bg-cream-warm/60 border border-charcoal/5 rounded-lg px-8 py-5">
            <span className="eyebrow text-charcoal/50">Order reference</span>
            <span className="font-serif text-2xl tracking-wide text-charcoal mt-1">{ref}</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {user && orderId ? (
              <Button asChild>
                <Link href={`/account/orders/${orderId}`}>
                  <Clock className="h-4 w-4" /> Track this order
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/menu">Back to menu <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
          </div>

          {/* Guest sign-up nudge */}
          {!user && (
            <div className="mt-14 bg-forest text-cream rounded-xl p-6 text-left flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-serif text-[19px] leading-tight">Make next time faster.</p>
                <p className="text-[13px] text-cream/80 mt-1.5 leading-relaxed">
                  Create an account to save your address, see your orders, and track them live.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 mt-4 text-[13px] font-medium underline underline-offset-2 hover:no-underline"
                >
                  Create account <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
