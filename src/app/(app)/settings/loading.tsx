/**
 * Settings loading skeleton.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div>
      <div className="page-header">
        <Skeleton width="120px" height="32px" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="settings-section" key={i}>
          <Skeleton width="160px" height="24px" />
          <Skeleton width="100%" height="16px" />
          <div className="settings-form">
            <div className="settings-row">
              <Skeleton width="100px" height="16px" />
              <Skeleton width="100%" height="40px" />
            </div>
            <div className="settings-row">
              <Skeleton width="120px" height="16px" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
