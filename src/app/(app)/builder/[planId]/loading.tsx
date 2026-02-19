/**
 * Plan detail loading state.
 */
import { SkeletonPlanTree } from '@/components/ui/Skeleton';

export default function PlanLoading() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" aria-hidden="true" />
      </div>
      <SkeletonPlanTree />
    </div>
  );
}
