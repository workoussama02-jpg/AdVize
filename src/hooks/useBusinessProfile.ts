/**
 * Hook for accessing the currently active business profile.
 * Delegates to BusinessProfileContext — the app layout must wrap
 * authenticated pages with <BusinessProfileProvider />.
 *
 * @hook useBusinessProfile
 */
'use client';

import { useBusinessProfiles } from '@/context/BusinessProfileContext';
export type { BusinessProfile } from '@/context/BusinessProfileContext';

export function useBusinessProfile() {
  const { activeProfile, isLoading, error, refresh } = useBusinessProfiles();
  return { profile: activeProfile, isLoading, error, refresh };
}
