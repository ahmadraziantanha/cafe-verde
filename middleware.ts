import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Edge runtime — must use Web Crypto, not Node's 'crypto'.

const ADMIN_COOKIE = 'cafe-verde-admin';
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [issued, sig] = value.split('.');
  if (!issued || !sig) return false;
  const secret = process.env.ADMIN_COOKIE_SECRET ?? 'dev-secret-change-me';
  const expected = await hmacSha256Hex(secret, issued);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return false;
  const age = Date.now() - Number(issued);
  return !Number.isNaN(age) && age <= ONE_WEEK_MS;
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Refresh Supabase auth cookies on every request (so server components see
  // the freshest session). Required by @supabase/ssr.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
  // IMPORTANT: getUser() (not getSession()) — validates against the auth server.
  await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // /admin gate (separate password-based admin auth)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const ok = await verifyAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Run on all paths except static files and image optimizer.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
