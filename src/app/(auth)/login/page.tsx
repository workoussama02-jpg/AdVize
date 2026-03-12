/**
 * Login page — email/password sign-in for internal use.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { auth } from '@/lib/insforge';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { session, error: authError } = await auth.signIn(email, password);

    if (authError || !session) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
      return;
    }

    // Sync session token to httpOnly cookie for middleware
    try {
      await fetch('/api/auth/session-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.access_token }),
      });
    } catch {
      // Non-fatal
    }

    window.location.href = '/dashboard';
  };

  return (
    <div className="centered-page">
      <div className="card centered-card">
        <div className="auth-logo">
          <Zap size={40} className="auth-logo-icon" aria-hidden="true" />
          <h1 className="auth-title">Welcome to AdVize</h1>
          <p className="auth-subtitle">Sign in to your account.</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputId="login-email"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              inputId="login-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="auth-btn-full"
            loading={isLoading}
            id="login-submit-btn"
          >
            Sign In
          </Button>
        </form>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <Link href="/" className="auth-back-link" id="login-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

