/**
 * OAuth callback handler — exchanges the InsForge OAuth code for a session.
 * InsForge uses PKCE and returns ?insforge_code= in the redirect URL.
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { auth } from '@/lib/insforge';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error from InsForge / Facebook
      const errorParam = searchParams.get('error') ?? searchParams.get('error_description');
      if (errorParam) {
        setError('Authentication was cancelled or failed. Please try again.');
        return;
      }

      // InsForge PKCE flow: sends ?insforge_code= in the redirect URL
      const code = searchParams.get('insforge_code');
      if (code) {
        const { session, error: exchangeErr } = await auth.exchangeOAuthCode(code);

        if (exchangeErr || !session) {
          setError('Authentication failed. Please try again.');
          return;
        }

        // Sync the access token to a Next.js httpOnly cookie so the middleware
        // can detect the session on subsequent requests.
        try {
          await fetch('/api/auth/session-set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: session.access_token }),
          });
        } catch {
          // Non-fatal: middleware may redirect to login on next page load
        }

        router.replace('/dashboard');
        return;
      }

      setError('No authorization code received. Please try logging in again.');
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="centered-page">
        <div className="card centered-card">
          <p className="auth-error" role="alert">
            {error}
          </p>
          <a href="/login" className="btn btn-primary" id="callback-retry-btn">
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="centered-page-column">
      <Zap size={40} className="auth-logo-icon" aria-hidden="true" />
      <div className="spinner" />
      <p className="auth-loading-text">Signing you in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="centered-page">
          <div className="spinner" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
