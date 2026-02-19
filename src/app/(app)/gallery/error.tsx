/**
 * Gallery error boundary.
 */
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <AlertTriangle size={48} className="empty-state-icon" aria-hidden="true" />
      <h2 className="empty-state-title">Gallery unavailable</h2>
      <p className="empty-state-description">
        Something went wrong loading your media gallery.
      </p>
      <Button variant="primary" onClick={reset} id="gallery-error-retry">
        Try Again
      </Button>
    </div>
  );
}
