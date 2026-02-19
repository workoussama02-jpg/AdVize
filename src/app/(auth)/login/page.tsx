/**
 * Login page — initiates Facebook OAuth via InsForge Auth.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/insforge';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const { url, error: authError } = await auth.signInWithFacebook(
      `${window.location.origin}/callback`
    );

    if (authError) {
      setError('We couldn\'t start the login process. Please try again.');
      setIsLoading(false);
      return;
    }

    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="centered-page">
      <div className="card centered-card">
        <div className="auth-logo">
          <Zap size={40} className="auth-logo-icon" aria-hidden="true" />
          <h1 className="auth-title">Welcome to AdVize</h1>
          <p className="auth-subtitle">
            Sign in with your Facebook account to connect your Meta Ads and get started.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="auth-btn-full"
          onClick={handleLogin}
          loading={isLoading}
          id="login-facebook-btn"
        >
          <Facebook size={20} aria-hidden="true" />
          Continue with Facebook
        </Button>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <p className="auth-disclaimer">
          We only request read access to your ad data. AdVize never modifies your campaigns.
        </p>

        <Link href="/" className="auth-back-link" id="login-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
