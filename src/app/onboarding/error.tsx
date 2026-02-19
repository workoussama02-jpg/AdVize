/**
 * Onboarding error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="centered-page">
      <div className="card centered-card">
        <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
        <h2 className="empty-state-title">Something went wrong</h2>
        <p className="empty-state-description">
          We couldn&apos;t load the onboarding flow. Please try again.
        </p>
        <Button variant="primary" onClick={reset} id="onboarding-error-retry">
          Try Again
        </Button>
      </div>
    </div>
  );
}
