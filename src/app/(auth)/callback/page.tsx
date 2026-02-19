/**
 * OAuth callback handler — exchanges auth code for session.
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
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received. Please try logging in again.');
      return;
    }

    const handleCallback = async () => {
      const { session, error: authError } = await auth.exchangeCodeForSession(code);

      if (authError || !session) {
        setError('Authentication failed. Please try again.');
        return;
      }

      router.replace('/dashboard');
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
