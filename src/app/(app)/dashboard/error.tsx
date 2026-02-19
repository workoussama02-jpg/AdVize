/**
 * Dashboard error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
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
        We couldn&apos;t load your dashboard. Please try again.
      </p>
      <Button variant="primary" onClick={reset} id="dashboard-error-retry">
        Try Again
      </Button>
    </div>
  );
}
