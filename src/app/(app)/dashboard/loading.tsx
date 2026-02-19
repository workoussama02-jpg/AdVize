/**
 * Dashboard loading state — skeleton loaders matching dashboard layout.
 */
import { SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" aria-hidden="true" />
      </div>
      <div className="quick-actions">
        <div className="skeleton" aria-hidden="true" />
        <div className="skeleton" aria-hidden="true" />
      </div>
      <div className="grid-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
