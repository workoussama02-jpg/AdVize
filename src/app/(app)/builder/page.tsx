/**
 * Campaign builder page — brief form → AI generates campaign plan → save to DB → redirect.
 * PRD Section 6.5.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BriefForm } from '@/components/builder/BriefForm';
import { SkeletonPlanTree } from '@/components/ui/Skeleton';
import { useAIStream } from '@/hooks/useAIStream';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { db, auth } from '@/lib/insforge';
import { AI_MODELS } from '@/lib/ai-prompts';

interface Brief {
  promotion: string;
  objective: string;
  ideal_customer: string;
  daily_budget: number;
  special_requirements?: string;
}

interface CampaignPlanRecord {
  id: string;
  title: string;
  brief: object;
  plan_data: object;
  status: string;
  ai_model_used: string;
  profile_id?: string | null;
}

/** Normalize raw AI JSON to the shape expected by CampaignTree / PlanView */
function normalizeAIOutput(raw: Record<string, unknown>): {
  title: string;
  campaigns: unknown[];
} {
  const campaigns = ((raw.campaigns as unknown[]) ?? []).map((c, ci) => {
    const campaign = c as Record<string, unknown>;
    // AI may return either 'adsets' or 'ad_sets'
    const rawAdsets = ((campaign.adsets ?? campaign.ad_sets ?? []) as unknown[]);

    const adsets = rawAdsets.map((a, ai) => {
      const adset = a as Record<string, unknown>;
      const rawAud = ((adset.audience_definition ?? adset.audience ?? {}) as Record<string, unknown>);

      const audience_definition = {
        type: String(rawAud.type ?? 'Interest'),
        demographics:
          typeof rawAud.demographics === 'object'
            ? JSON.stringify(rawAud.demographics)
            : String(rawAud.demographics ?? ''),
        interests: Array.isArray(rawAud.interests)
          ? (rawAud.interests as string[]).join(', ')
          : String(rawAud.interests ?? ''),
        exclusions: Array.isArray(rawAud.exclusions)
          ? (rawAud.exclusions as string[]).join(', ')
          : String(rawAud.exclusions ?? ''),
      };

      const ads = ((adset.ads as unknown[]) ?? []).map((ad, adIdx) => {
        const adObj = ad as Record<string, unknown>;
        return {
          id: crypto.randomUUID(),
          ad_name: String(adObj.ad_name ?? `Ad ${adIdx + 1}`),
          format: String(adObj.format ?? 'Single Image'),
          primary_texts: (adObj.primary_texts ?? []) as object[],
          headlines: (adObj.headlines ?? []) as object[],
          descriptions: (adObj.descriptions ?? []) as object[],
          cta_button: String(adObj.cta_button ?? 'Learn More'),
          copy_framework: String(adObj.copy_framework ?? 'PAS'),
          is_recommended: true,
        };
      });

      return {
        id: crypto.randomUUID(),
        adset_name: String(adset.adset_name ?? `Ad Set ${ai + 1}`),
        audience_definition,
        placements: Array.isArray(adset.placements)
          ? (adset.placements as string[]).join(', ')
          : String(adset.placements ?? 'Automatic'),
        retargeting_window: String(adset.retargeting_window ?? ''),
        budget_split: Number(adset.budget_split ?? 50),
        ads,
      };
    });

    return {
      id: crypto.randomUUID(),
      campaign_name: String(campaign.campaign_name ?? `Campaign ${ci + 1}`),
      objective: String(campaign.objective ?? 'TRAFFIC'),
      strategy_type: String(campaign.strategy_type ?? 'Cold'),
      budget_allocation: Number(campaign.budget_allocation ?? 100),
      optimization_event: String(campaign.optimization_event ?? 'LinkClick'),
      adsets,
    };
  });

  return {
    title: String(raw.title ?? `Campaign Plan — ${new Date().toLocaleDateString()}`),
    campaigns,
  };
}

export default function BuilderPage() {
  const router = useRouter();
  const { profile } = useBusinessProfile();
  const { content, isStreaming, error: streamError, elapsedTime, startStream, reset } = useAIStream();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const briefRef = useRef<Brief | null>(null);
  const savedRef = useRef(false);

  const handleSubmit = async (brief: Brief) => {
    briefRef.current = brief;
    savedRef.current = false;
    setSaveError(null);
    setIsGenerating(true);

    await startStream('/api/ai/campaign-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });

    setIsGenerating(false);
  };

  const handleReset = useCallback(() => {
    reset();
    setSaveError(null);
    savedRef.current = false;
  }, [reset]);

  // Once streaming finishes with content, parse → save to DB → redirect
  useEffect(() => {
    if (!content || isStreaming || savedRef.current) return;
    savedRef.current = true;

    const saveAndRedirect = async () => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // AI sometimes wraps JSON in markdown fences — extract the JSON object
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not parse AI response. Please try again.');

        const rawPlan = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        const normalized = normalizeAIOutput(rawPlan);
        const brief = briefRef.current!;

        // Ensure we have a profile_id (RLS requires it)
        let profileId: string | null = profile?.id ?? null;

        if (!profileId) {
          // Hook may not have resolved yet — try a direct DB fetch
          const pFetch = await db.from<{ id: string }>('business_profiles');
          const pResult = await pFetch.select('id').limit(1).execute();
          profileId = pResult.data?.[0]?.id ?? null;
        }

        if (!profileId) {
          // No profile exists at all — auto-create a minimal one from brief data
          const { user, error: authErr } = await auth.getUser();
          if (authErr || !user) throw new Error('Not authenticated. Please sign in again.');

          const pCreate = await db.from<{ id: string }>('business_profiles');
          const pCreated = await pCreate.insert({
            user_id: user.id,
            business_name: brief.promotion.slice(0, 80) || 'My Business',
            industry: 'Other',
            daily_budget: brief.daily_budget,
          });
          if (pCreated.error || !pCreated.data) {
            throw new Error('Failed to create business profile: ' + (pCreated.error?.message ?? 'unknown'));
          }
          profileId = (pCreated.data as { id: string }).id;
        }

        const query = await db.from<CampaignPlanRecord>('campaign_plans');
        const result = await query.insert({
          title: normalized.title,
          brief: {
            product_description: brief.promotion,
            objective: brief.objective,
            target_audience: brief.ideal_customer,
            daily_budget: brief.daily_budget,
            special_requirements: brief.special_requirements,
          },
          plan_data: { title: normalized.title, campaigns: normalized.campaigns },
          status: 'draft',
          ai_model_used: AI_MODELS.STRATEGY,
          profile_id: profileId,
        });

        if (result.error || !result.data) {
          throw new Error(result.error?.message ?? 'Failed to save plan');
        }

        router.push(`/builder/${result.data.id}`);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save plan. Please try again.');
        setIsSaving(false);
        savedRef.current = false;
      }
    };

    saveAndRedirect();
  }, [content, isStreaming, profile, router]);

  const error = saveError ?? streamError;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Builder</h1>
          <p className="page-subtitle">
            Describe your campaign and let AI generate a complete plan
          </p>
        </div>
      </div>

      {!isStreaming && !content && !isSaving && !error && (
        <div className="card">
          <BriefForm onSubmit={handleSubmit} isGenerating={isGenerating} />
        </div>
      )}

      {isStreaming && (
        <div>
          <div className="ai-status">
            <span className="ai-status-dot" />
            <span>Generating your campaign plan...</span>
            <span className="ai-elapsed">{elapsedTime}s</span>
          </div>
          <SkeletonPlanTree />
        </div>
      )}

      {isSaving && !error && (
        <div className="ai-status">
          <span className="ai-status-dot" />
          <span>Saving your campaign plan...</span>
        </div>
      )}

      {error && (
        <div className="card">
          <p className="auth-error" role="alert">{error}</p>
          <Button variant="secondary" onClick={handleReset} id="builder-retry">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
