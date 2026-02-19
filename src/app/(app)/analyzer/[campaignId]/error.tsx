/**
 * Analysis detail error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function AnalysisError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
      <h2 className="empty-state-title">Analysis failed</h2>
      <p className="empty-state-description">
        We couldn&apos;t complete the campaign analysis. Please try again.
      </p>
      <Button variant="primary" onClick={reset} id="analysis-error-retry">
        Try Again
      </Button>
    </div>
  );
}
