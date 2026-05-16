import { NextResponse } from 'next/server';
import { verifyPassword, setAdminCookie, clearAdminCookie } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password: string = body?.password ?? '';
  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
