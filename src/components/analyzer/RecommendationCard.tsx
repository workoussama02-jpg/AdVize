/**
 * Recommendation card — shows AI-generated recommendation with severity.
 * PRD Section 6.6.3.
 *
 * @component RecommendationCard
 */
'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/** Severity levels for recommendations */
type Severity = 'good' | 'warning' | 'critical';

interface RecommendationCardProps {
  title: string;
  severity: Severity;
  data: string;
  why: string;
  fix: string;
  expectedImpact: string;
  isApplied?: boolean;
  onToggleApplied?: () => void;
}

export function RecommendationCard({
  title,
  severity,
  data,
  why,
  fix,
  expectedImpact,
  isApplied = false,
  onToggleApplied,
}: RecommendationCardProps) {
  const severityConfig = {
    good: { icon: CheckCircle2, variant: 'success' as const, label: 'Good' },
    warning: { icon: AlertTriangle, variant: 'warning' as const, label: 'Warning' },
    critical: { icon: XCircle, variant: 'error' as const, label: 'Critical' },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <Icon size={16} className={`health-${severity}`} aria-hidden="true" />
        <span className="recommendation-title">{title}</span>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      <div className="recommendation-data">{data}</div>
      <div className="recommendation-why">{why}</div>
      <div className="recommendation-fix">{fix}</div>
      <div className="recommendation-impact">{expectedImpact}</div>

      {onToggleApplied && (
        <label className="checkbox-group">
          <input
            type="checkbox"
            className="checkbox"
            checked={isApplied}
            onChange={onToggleApplied}
            id={`applied-${title.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <span className="onboarding-consent-text">
            Mark as Applied
          </span>
        </label>
      )}
    </div>
  );
}
