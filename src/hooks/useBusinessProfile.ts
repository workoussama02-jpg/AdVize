/**
 * Hook for managing the current user's business profile.
 *
 * @hook useBusinessProfile
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/insforge';

/** Business profile data shape */
interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  daily_budget: number;
  website_url: string | null;
  scrape_consent: boolean;
  meta_connected: boolean;
  meta_ad_account_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseBusinessProfileReturn {
  /** The user's business profile */
  profile: BusinessProfile | null;
  /** Whether the profile is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Refreshes the profile data */
  refresh: () => Promise<void>;
}

export function useBusinessProfile(): UseBusinessProfileReturn {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = await db.from<BusinessProfile>('business_profiles');
      const result = await query.select('*').limit(1).execute();

      if (result.error) {
        setError(result.error.message);
      } else if (result.data && result.data.length > 0) {
        setProfile(result.data[0]);
      }
    } catch {
      setError('Failed to load business profile');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    profile,
    isLoading,
    error,
    refresh,
  };
}
