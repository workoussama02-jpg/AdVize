/**
 * Analysis detail loading state.
 */
import { SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';

export default function AnalysisLoading() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" aria-hidden="true" />
      </div>
      <div className="grid-3">
        <SkeletonMetric />
        <SkeletonMetric />
        <SkeletonMetric />
      </div>
      <SkeletonCard />
    </div>
  );
}
