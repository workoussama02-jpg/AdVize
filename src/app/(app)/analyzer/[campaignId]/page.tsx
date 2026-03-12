/**
 * Analysis results page — health score, metrics, AI recommendations.
 * PRD Section 6.6.3 / 6.6.4.
 */
'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HealthScore } from '@/components/analyzer/HealthScore';
import { MetricCard } from '@/components/analyzer/MetricCard';
import { RecommendationCard } from '@/components/analyzer/RecommendationCard';
import { SkeletonCard, SkeletonMetric } from '@/components/ui/Skeleton';
import { ai } from '@/lib/insforge';
import { fetchCampaignInsights } from '@/lib/meta-api';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

interface AIAnalysis {
  health_score: number;
  diagnosis: string;
  strengths: string[];
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    metric: string;
    finding: string;
    benchmark: string;
  }>;
  recommendations: Array<{
    priority: number;
    action: string;
    rationale: string;
    expected_impact: string;
  }>;
}

interface AnalysisPageProps {
  params: Promise<{ campaignId: string }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { campaignId } = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [rawMetrics, setRawMetrics] = useState<Record<string, string> | null>(null);

  const healthScore = analysis?.health_score ?? 0;

  const metrics: { label: string; value: string }[] = rawMetrics
    ? [
        { label: 'Spend', value: formatCurrency(parseFloat(rawMetrics.spend ?? '0')) },
        { label: 'Impressions', value: formatNumber(parseInt(rawMetrics.impressions ?? '0')) },
        { label: 'Reach', value: formatNumber(parseInt(rawMetrics.reach ?? '0')) },
        { label: 'CTR', value: formatPercent(parseFloat(rawMetrics.ctr ?? '0') / 100) },
        { label: 'CPC', value: formatCurrency(parseFloat(rawMetrics.cpc ?? '0')) },
        { label: 'CPM', value: formatCurrency(parseFloat(rawMetrics.cpm ?? '0')) },
        { label: 'ROAS', value: `${parseFloat(rawMetrics.roas ?? '0').toFixed(2)}x` },
        { label: 'Frequency', value: parseFloat(rawMetrics.frequency ?? '0').toFixed(2) },
      ]
    : [];

  const recommendations = (analysis?.recommendations ?? []).map((rec) => ({
    title: rec.action,
    severity: 'warning' as const,
    data: `Priority ${rec.priority}`,
    why: rec.rationale,
    fix: rec.action,
    expectedImpact: rec.expected_impact,
  }));

  const startAnalysis = async () => {
    setError(null);
    setIsLoading(true);
    setAnalysis(null);
    setRawMetrics(null);

    // Step 1: fetch campaign metrics from Meta
    const { insights, error: insightsError } = await fetchCampaignInsights(campaignId);
    if (insightsError || !insights) {
      setError(insightsError ?? 'Failed to fetch campaign metrics');
      setIsLoading(false);
      return;
    }
    setRawMetrics(insights as unknown as Record<string, string>);

    // Step 2: run AI analysis directly via InsForge SDK
    const systemPrompt = `You are AdVize, an expert Meta Ads analyst. Analyze the provided campaign metrics and return a structured JSON response.

Apply these diagnostic frameworks:
- Compare CTR, CPC, CPA against industry benchmarks
- Identify budget efficiency issues (high CPM, low relevance)
- Spot audience fatigue signals (rising frequency, falling CTR)
- Evaluate creative performance and flag structural issues

Return ONLY valid JSON in this exact shape:
{
  "health_score": <integer 0-100>,
  "diagnosis": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": [
    { "severity": "critical|warning|info", "metric": "<name>", "finding": "<what's wrong>", "benchmark": "<industry benchmark>" }
  ],
  "recommendations": [
    { "priority": 1, "action": "<specific action>", "rationale": "<why>", "expected_impact": "<outcome>" }
  ]
}`;

    const { content, error: aiError } = await ai.complete({
      model: 'x-ai/grok-4.1-fast',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Campaign Metrics:\n${JSON.stringify(insights, null, 2)}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    if (aiError || !content) {
      setError(aiError?.message ?? 'AI analysis failed');
      setIsLoading(false);
      return;
    }

    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as AIAnalysis;
      setAnalysis(parsed);
    } catch {
      setError('AI returned an unexpected response format');
    }

    setIsLoading(false);
  };

  const reset = () => {
    setError(null);
    setAnalysis(null);
    setRawMetrics(null);
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

      {!analysis && !isLoading && !error && (
        <div className="card centered-card">
          <p className="page-subtitle">
            Click below to analyze this campaign. AdVize will pull your Meta data and provide AI-powered recommendations.
          </p>
          <Button variant="primary" size="lg" onClick={startAnalysis} id="start-analysis">
            Analyze Campaign
          </Button>
        </div>
      )}

      {isLoading && (
        <div>
          <div className="ai-status">
            <span className="ai-status-dot" />
            <span>Analyzing campaign performance...</span>
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

      {analysis && !isLoading && (
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
