/**
 * Plan view — displays the generated campaign plan with sidebar summary.
 * PRD Section 6.5.5.
 *
 * @component PlanView
 */
'use client';

import { useState } from 'react';
import {
  Download,
  RefreshCw,
  Check,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CampaignTree } from '@/components/builder/CampaignTree';
import { formatDate } from '@/lib/utils';

/** Campaign plan data structure */
interface PlanData {
  id: string;
  title: string;
  status: 'draft' | 'approved' | 'exported' | 'archived';
  brief: {
    product_description: string;
    objective: string;
    target_audience: string;
    daily_budget: number;
    special_requirements?: string;
  };
  campaigns: CampaignNode[];
  createdAt: string;
}

/** Campaign node — matches CampaignTree interface */
interface CampaignNode {
  id: string;
  campaign_name: string;
  objective: string;
  strategy_type: string;
  budget_allocation: number;
  optimization_event: string;
  adsets: AdsetNode[];
}

interface AdsetNode {
  id: string;
  adset_name: string;
  audience_definition: {
    type: string;
    demographics: string;
    interests: string;
    exclusions: string;
  };
  placements: string;
  retargeting_window: string;
  budget_split: number;
  ads: AdNode[];
}

interface AdNode {
  id: string;
  ad_name: string;
  format: string;
  primary_texts: { text: string; rank: number; is_recommended: boolean }[];
  headlines: { text: string; rank: number; is_recommended: boolean }[];
  descriptions: { text: string; rank: number; is_recommended: boolean }[];
  cta_button: string;
  copy_framework: string;
  is_recommended: boolean;
}

interface PlanViewProps {
  plan: PlanData;
  onApprove?: (nodeId: string, nodeType: string) => void;
  onRegenerate?: (nodeId: string, nodeType: string, guidance?: string) => void;
  onRegenerateAll?: () => void;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export function PlanView({
  plan,
  onApprove,
  onRegenerate,
  onRegenerateAll,
  onExportPdf,
  isExporting,
}: PlanViewProps) {
  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
      draft: 'neutral',
      approved: 'success',
      exported: 'info',
      archived: 'neutral',
    };
    return map[status] ?? 'neutral';
  };

  return (
    <div className="builder-layout">
      {/* Left panel — brief summary */}
      <div className="builder-sidebar">
        <div className="card">
          <h2 className="section-label">Brief Summary</h2>
          <div className="brief-summary">
            <div className="brief-summary-item">
              <span className="brief-summary-label">Promoting</span>
              <span className="brief-summary-value">{plan.brief.product_description}</span>
            </div>
            <div className="brief-summary-item">
              <span className="brief-summary-label">Objective</span>
              <span className="brief-summary-value">{plan.brief.objective}</span>
            </div>
            <div className="brief-summary-item">
              <span className="brief-summary-label">Audience</span>
              <span className="brief-summary-value">{plan.brief.target_audience}</span>
            </div>
            <div className="brief-summary-item">
              <span className="brief-summary-label">Daily Budget</span>
              <span className="brief-summary-value">${plan.brief.daily_budget}/day</span>
            </div>
            {plan.brief.special_requirements && (
              <div className="brief-summary-item">
                <span className="brief-summary-label">Requirements</span>
                <span className="brief-summary-value">{plan.brief.special_requirements}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="plan-card-meta">
            <Badge variant={getStatusVariant(plan.status)}>
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Badge>
            <span className="plan-card-meta-separator" />
            <Clock size={12} aria-hidden="true" />
            <span>{formatDate(plan.createdAt)}</span>
          </div>
        </div>

        <div className="builder-sidebar">
          {onExportPdf && (
            <Button
              variant="primary"
              loading={isExporting}
              onClick={onExportPdf}
              id="plan-export-pdf"
            >
              <Download size={16} aria-hidden="true" />
              Export PDF
            </Button>
          )}
          {onRegenerateAll && (
            <Button variant="secondary" onClick={onRegenerateAll} id="plan-regenerate-all">
              <RefreshCw size={16} aria-hidden="true" />
              Regenerate All
            </Button>
          )}
        </div>
      </div>

      {/* Right panel — campaign tree */}
      <div className="builder-main">
        <div className="page-header">
          <h1 className="page-title">{plan.title}</h1>
        </div>
        <CampaignTree
          campaigns={plan.campaigns}
          onApprove={onApprove}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  );
}
