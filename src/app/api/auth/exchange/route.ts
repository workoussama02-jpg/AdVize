import { NextResponse } from 'next/server';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
// GoTrue user-level token exchange requires the anon key, not the service key
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body?.code;
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    const tokenRes = await fetch(`${INSFORGE_URL}/auth/v1/token?grant_type=authorization_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: INSFORGE_ANON_KEY,
      },
      body: JSON.stringify({ code }),
    });

    const text = await tokenRes.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!tokenRes.ok) {
      return NextResponse.json(json, { status: tokenRes.status });
    }

    const res = NextResponse.json(json, { status: 200 });

    // Set session cookies from the JSON body — InsForge returns tokens in the
    // response body when called server-to-server (not as set-cookie headers).
    const accessToken = json.access_token as string | undefined;
    const refreshToken = json.refresh_token as string | undefined;
    const expiresIn = (json.expires_in as number | undefined) ?? 3600;

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: expiresIn,
    };

    if (accessToken) {
      res.cookies.set('access_token', accessToken, cookieOpts);
    }
    if (refreshToken) {
      res.cookies.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
    }

    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
