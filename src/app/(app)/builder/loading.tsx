/**
 * Builder loading state.
 */
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function BuilderLoading() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" aria-hidden="true" />
      </div>
      <SkeletonCard />
    </div>
  );
}
