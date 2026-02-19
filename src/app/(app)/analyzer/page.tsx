/**
 * Analyzer page — campaign list to select for analysis.
 * PRD Section 6.6.4.
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useMetaCampaigns } from '@/hooks/useMetaCampaigns';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AnalyzerPage() {
  const { campaigns, isLoading, error, loadCampaigns } = useMetaCampaigns();

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Analyzer</h1>
        </div>
        <div className="grid-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Analyzer</h1>
        </div>
        <EmptyState
          icon={WifiOff}
          title="Couldn't load campaigns"
          description="We couldn't reach your Meta account. Please check your connection and try again."
          action={
            <Button variant="primary" onClick={() => loadCampaigns()} id="analyzer-retry">
              <RefreshCw size={16} aria-hidden="true" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Analyzer</h1>
        </div>
        <EmptyState
          icon={BarChart3}
          title="Connect Meta and analyze your first campaign"
          description="Connect your Meta ad account in Settings to pull campaign data for AI-powered analysis."
          action={
            <Link href="/settings" className="btn btn-primary" id="analyzer-connect">
              Go to Settings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Analyzer</h1>
          <p className="page-subtitle">Select a campaign to get AI-powered performance diagnosis</p>
        </div>
        <Button variant="secondary" onClick={() => loadCampaigns()} id="analyzer-refresh">
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="grid-2">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/analyzer/${campaign.id}`}
            className="card card-hover plan-card"
            id={`campaign-${campaign.id}`}
          >
            <div className="plan-card-header">
              <span className="plan-card-title">{campaign.name}</span>
              <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {campaign.status}
              </Badge>
            </div>
            <div className="plan-card-meta">
              <span>{campaign.objective}</span>
              <span className="plan-card-meta-separator" />
              <span>{formatCurrency(Number(campaign.daily_budget))}/day</span>
              <span className="plan-card-meta-separator" />
              <span>{formatDate(campaign.created_time)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
