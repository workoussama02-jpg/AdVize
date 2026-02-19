/**
 * Builder error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function BuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
      <h2 className="empty-state-title">Something went wrong</h2>
      <p className="empty-state-description">
        We couldn&apos;t load the campaign builder. Please try again.
      </p>
      <Button variant="primary" onClick={reset} id="builder-error-retry">
        Try Again
      </Button>
    </div>
  );
}
