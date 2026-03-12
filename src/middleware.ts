/**
 * Next.js middleware — protects authenticated app routes.
 *
 * Public routes (landing page, login, OAuth callback) are allowed through.
 * Any other route requires a valid session cookie. Unauthenticated requests
 * are redirected to /login.
 *
 * Session validation is intentionally lightweight here (cookie presence check)
 * to keep the middleware fast. Full JWT verification happens at the InsForge
 * edge when actual API calls are made (RLS enforcement).
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Routes that do not require authentication */
const PUBLIC_ROUTES = ['/', '/login', '/callback', '/api/auth/session-set', '/api/auth/refresh', '/api/auth/exchange'];

/** Prefixes that are always public (static assets, Next.js internals) */
const PUBLIC_PREFIXES = ['/_next/', '/favicon', '/fonts/', '/images/'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Look for any InsForge session cookie. GoTrue sets cookies whose names
  // typically start with "sb-" (Supabase/GoTrue convention) or contain
  // "access_token" / "auth_token". Accept any of these as proof of a session.
  const cookies = request.cookies;
  const hasSession =
    cookies.has('access_token') ||
    cookies.has('auth_token') ||
    [...cookies.getAll()].some(
      (c) => c.name.startsWith('sb-') || c.name.includes('access_token')
    );

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
