/**
 * Gallery loading skeleton.
 */
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function GalleryLoading() {
  return (
    <div>
      <div className="page-header">
        <Skeleton width="140px" height="32px" />
        <Skeleton width="120px" height="40px" />
      </div>
      <div className="upload-zone">
        <Skeleton width="48px" height="48px" />
        <Skeleton width="220px" height="20px" />
        <Skeleton width="180px" height="16px" />
      </div>
      <div className="media-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
