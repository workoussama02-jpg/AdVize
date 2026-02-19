/**
 * Settings error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
      <h2 className="empty-state-title">Settings unavailable</h2>
      <p className="empty-state-description">
        We couldn&apos;t load your settings. Please try again.
      </p>
      <Button variant="primary" onClick={reset} id="settings-error-retry">
        Try Again
      </Button>
    </div>
  );
}
