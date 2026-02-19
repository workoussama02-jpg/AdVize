/**
 * Campaign tree — expandable hierarchy showing campaign → adset → ad structure.
 * PRD Section 6.5.5.
 *
 * @component CampaignTree
 */
'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { AdCopyCard } from '@/components/builder/AdCopyCard';

/** Campaign-level data structure from AI output */
interface CampaignNode {
  id: string;
  campaign_name: string;
  objective: string;
  strategy_type: string;
  budget_allocation: number;
  optimization_event: string;
  adsets: AdsetNode[];
}

/** Adset-level data structure */
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

/** Ad-level data structure */
interface AdNode {
  id: string;
  ad_name: string;
  format: string;
  primary_texts: CopyVariation[];
  headlines: CopyVariation[];
  descriptions: CopyVariation[];
  cta_button: string;
  copy_framework: string;
  is_recommended: boolean;
}

/** Copy variation with ranking */
interface CopyVariation {
  text: string;
  rank: number;
  is_recommended: boolean;
}

interface CampaignTreeProps {
  campaigns: CampaignNode[];
  onApprove?: (nodeId: string, nodeType: string) => void;
  onRegenerate?: (nodeId: string, nodeType: string, guidance?: string) => void;
}

export function CampaignTree({ campaigns, onApprove, onRegenerate }: CampaignTreeProps) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
    new Set(campaigns.map((c) => c.id))
  );
  const [expandedAdsets, setExpandedAdsets] = useState<Set<string>>(new Set());

  const toggleCampaign = (id: string) => {
    const next = new Set(expandedCampaigns);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCampaigns(next);
  };

  const toggleAdset = (id: string) => {
    const next = new Set(expandedAdsets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedAdsets(next);
  };

  return (
    <div className="campaign-tree">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="tree-node tree-node-level-1">
          <button
            className="tree-node-header"
            onClick={() => toggleCampaign(campaign.id)}
            aria-expanded={expandedCampaigns.has(campaign.id)}
            id={`campaign-toggle-${campaign.id}`}
          >
            <div className="tree-node-title">
              {expandedCampaigns.has(campaign.id) ? (
                <ChevronDown size={16} aria-hidden="true" />
              ) : (
                <ChevronRight size={16} aria-hidden="true" />
              )}
              <Target size={16} aria-hidden="true" />
              {campaign.campaign_name}
            </div>
            <div className="plan-card-meta">
              <Badge variant="info">{campaign.objective}</Badge>
              <span className="plan-card-meta-separator" />
              <span>{campaign.strategy_type}</span>
              <span className="plan-card-meta-separator" />
              <span>{campaign.budget_allocation}% budget</span>
            </div>
          </button>

          {expandedCampaigns.has(campaign.id) && (
            <div className="tree-node-children">
              {campaign.adsets.map((adset) => (
                <div key={adset.id} className="tree-node tree-node-level-2">
                  <button
                    className="tree-node-header"
                    onClick={() => toggleAdset(adset.id)}
                    aria-expanded={expandedAdsets.has(adset.id)}
                    id={`adset-toggle-${adset.id}`}
                  >
                    <div className="tree-node-title">
                      {expandedAdsets.has(adset.id) ? (
                        <ChevronDown size={14} aria-hidden="true" />
                      ) : (
                        <ChevronRight size={14} aria-hidden="true" />
                      )}
                      <Users size={14} aria-hidden="true" />
                      {adset.adset_name}
                    </div>
                    <div className="plan-card-meta">
                      <Badge variant="neutral">{adset.audience_definition.type}</Badge>
                      {adset.retargeting_window && (
                        <>
                          <span className="plan-card-meta-separator" />
                          <span>{adset.retargeting_window}</span>
                        </>
                      )}
                    </div>
                  </button>

                  {expandedAdsets.has(adset.id) && (
                    <div className="tree-node-children">
                      {/* Audience details */}
                      <div className="brief-summary">
                        <div className="brief-summary-item">
                          <span className="brief-summary-label">Demographics</span>
                          <span className="brief-summary-value">{adset.audience_definition.demographics}</span>
                        </div>
                        <div className="brief-summary-item">
                          <span className="brief-summary-label">Interests</span>
                          <span className="brief-summary-value">{adset.audience_definition.interests}</span>
                        </div>
                        <div className="brief-summary-item">
                          <span className="brief-summary-label">Exclusions</span>
                          <span className="brief-summary-value">{adset.audience_definition.exclusions}</span>
                        </div>
                        <div className="brief-summary-item">
                          <span className="brief-summary-label">Placements</span>
                          <span className="brief-summary-value">{adset.placements}</span>
                        </div>
                      </div>

                      {/* Ads */}
                      {adset.ads.map((ad) => (
                        <AdCopyCard
                          key={ad.id}
                          ad={ad}
                          onApprove={onApprove ? () => onApprove(ad.id, 'ad') : undefined}
                          onRegenerate={onRegenerate ? (guidance) => onRegenerate(ad.id, 'ad', guidance) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
