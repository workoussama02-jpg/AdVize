/**
 * Plan detail error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function PlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
      <h2 className="empty-state-title">Couldn&apos;t load this plan</h2>
      <p className="empty-state-description">
        We couldn&apos;t load your campaign plan. Please try again.
      </p>
      <Button variant="primary" onClick={reset} id="plan-error-retry">
        Try Again
      </Button>
    </div>
  );
}
