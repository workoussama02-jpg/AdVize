/**
 * POST /api/auth/session-set
 * Syncs the InsForge SDK access token to a Next.js httpOnly cookie so the
 * middleware can detect authenticated sessions.
 *
 * DELETE /api/auth/session-set
 * Clears the session cookie on logout.
 */
import { NextResponse } from 'next/server';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  /** 7-day session window — the SDK refreshes the access token automatically */
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const accessToken = body?.accessToken;

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('access_token', accessToken, COOKIE_OPTS);
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', '', { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
