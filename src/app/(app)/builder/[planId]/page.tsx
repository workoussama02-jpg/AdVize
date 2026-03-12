/**
 * Plan detail page — loads a saved campaign plan from the DB and renders it.
 * PRD Section 6.5.4 / 6.5.5.
 */
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanView } from '@/components/builder/PlanView';
import { SkeletonPlanTree } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/insforge';

interface PlanPageProps {
  params: Promise<{ planId: string }>;
}

interface CampaignPlanRecord {
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
  plan_data: {
    title: string;
    campaigns: Parameters<typeof PlanView>[0]['plan']['campaigns'];
  };
  created_at: string;
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const { planId } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<CampaignPlanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const query = await db.from<CampaignPlanRecord>('campaign_plans');
        const result = await query.select('*').eq('id', planId).limit(1).execute();

        if (result.error) {
          setError(result.error.message);
        } else if (!result.data || result.data.length === 0) {
          setError('Plan not found.');
        } else {
          setPlan(result.data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Plan</h1>
        </div>
        <SkeletonPlanTree />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Plan</h1>
        </div>
        <div className="card">
          <p className="auth-error" role="alert">{error ?? 'Plan not found.'}</p>
          <Button variant="secondary" onClick={() => router.push('/builder')} id="plan-back">
            Back to Builder
          </Button>
        </div>
      </div>
    );
  }

  const planData = {
    id: plan.id,
    title: plan.title,
    status: plan.status,
    brief: plan.brief,
    campaigns: plan.plan_data?.campaigns ?? [],
    createdAt: plan.created_at,
  };

  return (
    <PlanView
      plan={planData}
      onApprove={(nodeId, nodeType) => {
        console.log('Approve', nodeId, nodeType);
      }}
      onRegenerate={(nodeId, nodeType, guidance) => {
        console.log('Regenerate', nodeId, nodeType, guidance);
      }}
      onRegenerateAll={() => {
        console.log('Regenerate all');
      }}
      onExportPdf={() => {
        console.log('Export PDF');
      }}
    />
  );
}
