/**
 * Hook for fetching Meta campaigns via InsForge Edge Functions.
 *
 * @hook useMetaCampaigns
 */
'use client';

import { useState, useCallback } from 'react';
import { type MetaCampaign, type CampaignInsights, fetchCampaigns, fetchCampaignInsights } from '@/lib/meta-api';

interface UseMetaCampaignsReturn {
  /** List of campaigns from Meta */
  campaigns: MetaCampaign[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Fetches the list of campaigns */
  loadCampaigns: () => Promise<void>;
  /** Fetches insights for a specific campaign */
  loadInsights: (campaignId: string) => Promise<CampaignInsights | null>;
}

export function useMetaCampaigns(): UseMetaCampaignsReturn {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchCampaigns();

    if (result.error) {
      setError(result.error);
    } else {
      setCampaigns(result.campaigns);
    }

    setIsLoading(false);
  }, []);

  const loadInsights = useCallback(async (campaignId: string): Promise<CampaignInsights | null> => {
    const result = await fetchCampaignInsights(campaignId);

    if (result.error) {
      setError(result.error);
      return null;
    }

    return result.insights;
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    loadCampaigns,
    loadInsights,
  };
}
