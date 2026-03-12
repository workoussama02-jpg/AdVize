import { NextResponse } from 'next/server';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';

/**
 * Exchanges an OAuth authorization code for a session.
 * Called when InsForge redirects to this route after Facebook OAuth (GET with ?code=).
 */
async function handleOAuthCallback(code: string, redirectTo: string) {
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
    // Redirect to login with an error flag so the user gets a clear message
    return NextResponse.redirect(new URL('/login?error=auth_failed', redirectTo));
  }

  // Set session cookies from the JSON body — server-to-server token calls return
  // tokens in the body, not as set-cookie headers.
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

  const destination = redirectTo.endsWith('/') ? `${redirectTo}dashboard` : `${new URL(redirectTo).origin}/dashboard`;
  const res = NextResponse.redirect(new URL(destination));

  if (accessToken) {
    res.cookies.set('access_token', accessToken, cookieOpts);
  }
  if (refreshToken) {
    res.cookies.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  }

  return res;
}

/**
 * Refreshes an existing session using the httpOnly refresh-token cookie.
 */
async function handleSessionRefresh(req: Request) {
  const cookie = req.headers.get('cookie') ?? '';

  // Extract refresh_token from cookie if present
  const refreshTokenMatch = cookie.match(/(?:^|;\s*)refresh_token=([^;]+)/);
  const refreshToken = refreshTokenMatch?.[1];

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const tokenRes = await fetch(`${INSFORGE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: INSFORGE_ANON_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
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

  // Set session cookies from the JSON body (server-to-server calls don't get set-cookie).
  const accessToken = json.access_token as string | undefined;
  const newRefreshToken = json.refresh_token as string | undefined;
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
  if (newRefreshToken) {
    res.cookies.set('refresh_token', newRefreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  }

  return res;
}

/**
 * GET /api/auth/refresh
 * InsForge redirects here after Facebook OAuth with ?code=... to complete login.
 * Also handles explicit session refresh requests.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
      // This is the OAuth callback from InsForge — exchange code for session
      const origin = url.origin;
      return await handleOAuthCallback(code, origin);
    }

    // No code — treat as a session refresh probe; return 401 so the client knows
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/auth/refresh
 * Explicit session refresh using the stored refresh_token cookie.
 */
export async function POST(req: Request) {
  try {
    return await handleSessionRefresh(req);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
