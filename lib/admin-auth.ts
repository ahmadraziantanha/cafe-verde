import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// Portfolio-grade auth: a single password from env, gated by a signed cookie.
// For a real production app, swap this for Supabase Auth.

const COOKIE_NAME = 'cafe-verde-admin';
const ONE_WEEK = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.ADMIN_COOKIE_SECRET ?? 'dev-secret-change-me';
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected) return false;
  return safeEq(input, expected);
}

export async function setAdminCookie() {
  const issued = String(Date.now());
  const sig = sign(issued);
  cookies().set(COOKIE_NAME, `${issued}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK,
  });
}

export async function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export function isAdmin(): boolean {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [issued, sig] = raw.split('.');
  if (!issued || !sig) return false;
  if (!safeEq(sign(issued), sig)) return false;
  const ageMs = Date.now() - Number(issued);
  if (Number.isNaN(ageMs) || ageMs > ONE_WEEK * 1000) return false;
  return true;
}
