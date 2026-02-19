/**
 * Meta Marketing API client — read-only access.
 * All Meta API calls go through InsForge Edge Functions.
 *
 * @module meta-api
 */

import { functions } from '@/lib/insforge';

/** Campaign data returned from Meta API */
export interface MetaCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  daily_budget: string;
  lifetime_budget: string;
  created_time: string;
  updated_time: string;
}

/** Campaign insight metrics from Meta API */
export interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  reach: string;
  frequency: string;
  ctr: string;
  cpc: string;
  cpm: string;
  clicks: string;
  unique_clicks: string;
  conversions: string;
  cost_per_result: string;
  roas: string;
  date_start: string;
  date_stop: string;
  age_gender_breakdown: Array<{
    age: string;
    gender: string;
    impressions: string;
    clicks: string;
  }>;
  placement_breakdown: Array<{
    publisher_platform: string;
    impressions: string;
    clicks: string;
    spend: string;
  }>;
}

/**
 * Fetches the list of campaigns from the connected Meta ad account.
 */
export async function fetchCampaigns(): Promise<{
  campaigns: MetaCampaign[];
  error: string | null;
}> {
  const { data, error } = await functions.invoke<{ campaigns: MetaCampaign[] }>(
    'meta-fetch-campaigns'
  );

  if (error) {
    return { campaigns: [], error: error.message };
  }

  return { campaigns: data?.campaigns ?? [], error: null };
}

/**
 * Fetches detailed insights for a specific campaign.
 */
export async function fetchCampaignInsights(campaignId: string): Promise<{
  insights: CampaignInsights | null;
  error: string | null;
}> {
  const { data, error } = await functions.invoke<CampaignInsights>(
    'meta-fetch-insights',
    { campaign_id: campaignId }
  );

  if (error) {
    return { insights: null, error: error.message };
  }

  return { insights: data, error: null };
}

/**
 * Refreshes the Meta access token if it's close to expiring.
 */
export async function refreshMetaToken(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const { error } = await functions.invoke('meta-refresh-token');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
