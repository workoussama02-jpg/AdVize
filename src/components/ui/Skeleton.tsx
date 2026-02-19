/**
 * Skeleton loader components matching content shapes.
 *
 * @component Skeleton
 */

interface SkeletonProps {
  /** Width of the skeleton */
  width?: string;
  /** Height of the skeleton */
  height?: string;
  /** Border radius override */
  radius?: string;
  /** Additional CSS class */
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', radius, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** Skeleton for a full card */
export function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton height="16px" width="60%" />
      <div className="skeleton-spacer-sm">
        <Skeleton height="12px" width="40%" />
      </div>
      <div className="skeleton-spacer-md">
        <Skeleton height="12px" width="100%" />
      </div>
      <div className="skeleton-spacer-xs">
        <Skeleton height="12px" width="80%" />
      </div>
      <div className="skeleton-spacer-md skeleton-row">
        <Skeleton height="24px" width="80px" radius="9999px" />
        <Skeleton height="24px" width="60px" radius="9999px" />
      </div>
    </div>
  );
}

/** Skeleton for a metrics row */
export function SkeletonMetric() {
  return (
    <div className="metric-card" aria-hidden="true">
      <Skeleton height="36px" width="120px" />
      <Skeleton height="14px" width="80px" />
    </div>
  );
}

/** Skeleton for the campaign plan tree */
export function SkeletonPlanTree() {
  return (
    <div className="skeleton-tree" aria-hidden="true">
      <Skeleton height="24px" width="200px" />
      <div className="skeleton-tree-indent">
        <Skeleton height="16px" width="180px" />
        <div className="skeleton-spacer-sm">
          <Skeleton height="14px" width="90%" />
        </div>
        <div className="skeleton-spacer-xs">
          <Skeleton height="14px" width="75%" />
        </div>
        <div className="skeleton-spacer-xs">
          <Skeleton height="14px" width="80%" />
        </div>
      </div>
      <div className="skeleton-tree-indent-deep">
        <Skeleton height="16px" width="160px" />
        <div className="skeleton-spacer-sm">
          <Skeleton height="100px" width="100%" />
        </div>
      </div>
    </div>
  );
}
