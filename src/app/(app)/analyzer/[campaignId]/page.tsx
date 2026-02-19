/**
 * Analysis results page — health score, metrics, AI recommendations.
 * PRD Section 6.6.3 / 6.6.4.
 */
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HealthScore } from '@/components/analyzer/HealthScore';
import { MetricCard } from '@/components/analyzer/MetricCard';
import { RecommendationCard } from '@/components/analyzer/RecommendationCard';
import { SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';
import { useAIStream } from '@/hooks/useAIStream';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

interface AnalysisPageProps {
  params: Promise<{ campaignId: string }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { campaignId } = use(params);
  const { content, isStreaming, error, elapsedTime, startStream, reset } = useAIStream();
  const [analysisStarted, setAnalysisStarted] = useState(false);

  /** Placeholder for analysis results — in production, parsed from AI stream */
  const healthScore = 0;
  const metrics: { label: string; value: string }[] = [];
  const recommendations: {
    title: string;
    severity: 'good' | 'warning' | 'critical';
    data: string;
    why: string;
    fix: string;
    expectedImpact: string;
  }[] = [];

  const startAnalysis = async () => {
    setAnalysisStarted(true);
    await startStream('/api/ai/analyze-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId }),
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/analyzer" className="auth-back-link" id="analysis-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to campaigns
          </Link>
          <h1 className="page-title">Campaign Analysis</h1>
        </div>
      </div>

      {!analysisStarted && (
        <div className="card centered-card">
          <p className="page-subtitle">
            Click below to analyze this campaign. AdVize will pull your Meta data and provide AI-powered recommendations.
          </p>
          <Button variant="primary" size="lg" onClick={startAnalysis} id="start-analysis">
            Analyze Campaign
          </Button>
        </div>
      )}

      {isStreaming && (
        <div>
          <div className="ai-status">
            <span className="ai-status-dot" />
            <span>Analyzing campaign performance...</span>
            <span className="ai-elapsed">{elapsedTime}s</span>
          </div>
          <div className="grid-3">
            <SkeletonMetric />
            <SkeletonMetric />
            <SkeletonMetric />
          </div>
          <SkeletonCard />
        </div>
      )}

      {error && (
        <div className="card">
          <p className="auth-error" role="alert">
            We couldn&apos;t analyze this campaign. {error}
          </p>
          <Button variant="secondary" onClick={reset} id="analysis-retry">
            <RefreshCw size={16} aria-hidden="true" />
            Try Again
          </Button>
        </div>
      )}

      {content && !isStreaming && (
        <div>
          {/* Health Score */}
          <HealthScore score={healthScore} />

          {/* Key Metrics */}
          {metrics.length > 0 && (
            <>
              <h2 className="section-label">Key Metrics</h2>
              <div className="grid-3">
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            </>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <>
              <div className="divider" />
              <h2 className="section-label">Recommendations</h2>
              {recommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  title={rec.title}
                  severity={rec.severity}
                  data={rec.data}
                  why={rec.why}
                  fix={rec.fix}
                  expectedImpact={rec.expectedImpact}
                  onToggleApplied={() => {
                    /* Mark recommendation as applied in DB */
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
