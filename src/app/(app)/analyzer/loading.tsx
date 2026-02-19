/**
 * Analyzer loading state.
 */
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function AnalyzerLoading() {
  return (
    <div>
      <div className="page-header">
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
