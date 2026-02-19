/**
 * Ad copy card — shows copy variations with rankings and actions.
 * PRD Section 6.5.2 / 6.5.4.
 *
 * @component AdCopyCard
 */
'use client';

import { useState } from 'react';
import {
  FileText,
  Check,
  RefreshCw,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/** Copy variation with ranking */
interface CopyVariation {
  text: string;
  rank: number;
  is_recommended: boolean;
}

/** Ad node data */
interface AdData {
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

interface AdCopyCardProps {
  ad: AdData;
  onApprove?: () => void;
  onRegenerate?: (guidance?: string) => void;
}

export function AdCopyCard({ ad, onApprove, onRegenerate }: AdCopyCardProps) {
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [regenGuidance, setRegenGuidance] = useState('');

  const handleRegenerate = () => {
    onRegenerate?.(regenGuidance || undefined);
    setShowRegenInput(false);
    setRegenGuidance('');
  };

  const renderVariations = (label: string, variations: CopyVariation[]) => (
    <div className="copy-variation-group">
      <span className="copy-variation-label">{label}</span>
      {variations
        .sort((a, b) => a.rank - b.rank)
        .map((variation, index) => (
          <div
            key={index}
            className={`copy-variation-item ${variation.is_recommended ? 'recommended' : ''}`}
          >
            <span className="copy-variation-rank">
              {variation.is_recommended ? (
                <Star size={12} aria-label="Recommended" />
              ) : (
                `#${variation.rank}`
              )}
            </span>
            <span className="copy-variation-text">{variation.text}</span>
          </div>
        ))}
    </div>
  );

  return (
    <div className="ad-copy-card">
      <div className="ad-copy-header">
        <div className="tree-node-title">
          <FileText size={14} aria-hidden="true" />
          <span className="ad-copy-name">{ad.ad_name}</span>
        </div>
        <div className="plan-card-meta">
          <Badge variant="neutral">{ad.format}</Badge>
          <span className="plan-card-meta-separator" />
          <span className="ad-copy-framework">{ad.copy_framework}</span>
        </div>
      </div>

      {renderVariations('Primary Text', ad.primary_texts)}
      {renderVariations('Headline', ad.headlines)}
      {renderVariations('Description', ad.descriptions)}

      <div className="brief-summary-item">
        <span className="brief-summary-label">CTA Button</span>
        <span className="brief-summary-value">{ad.cta_button}</span>
      </div>

      {showRegenInput && (
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Optional guidance: 'make it more urgent', 'focus on pricing'..."
            value={regenGuidance}
            onChange={(e) => setRegenGuidance(e.target.value)}
            id={`regen-guidance-${ad.id}`}
          />
        </div>
      )}

      <div className="ad-copy-actions">
        {onApprove && (
          <Button variant="primary" size="sm" onClick={onApprove} id={`approve-${ad.id}`}>
            <Check size={14} aria-hidden="true" />
            Approve
          </Button>
        )}
        {onRegenerate && !showRegenInput && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRegenInput(true)}
            id={`regen-toggle-${ad.id}`}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Regenerate
          </Button>
        )}
        {showRegenInput && (
          <>
            <Button variant="primary" size="sm" onClick={handleRegenerate} id={`regen-submit-${ad.id}`}>
              <RefreshCw size={14} aria-hidden="true" />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRegenInput(false)}
              id={`regen-cancel-${ad.id}`}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
