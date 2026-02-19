/**
 * Onboarding loading skeleton.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function OnboardingLoading() {
  return (
    <div className="centered-page">
      <div className="card centered-card-wide">
        <Skeleton width="48px" height="48px" />
        <Skeleton width="200px" height="28px" />
        <Skeleton width="100%" height="8px" />
        <Skeleton width="240px" height="24px" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="100%" height="48px" />
        <div className="onboarding-nav">
          <Skeleton width="80px" height="40px" />
          <Skeleton width="80px" height="40px" />
        </div>
      </div>
    </div>
  );
}
