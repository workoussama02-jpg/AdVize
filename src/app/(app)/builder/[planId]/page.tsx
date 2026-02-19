/**
 * Plan detail page — view and edit a generated campaign plan.
 * PRD Section 6.5.4 / 6.5.5.
 */
'use client';

import { use } from 'react';
import { PlanView } from '@/components/builder/PlanView';
import { SkeletonPlanTree } from '@/components/ui/Skeleton';

interface PlanPageProps {
  params: Promise<{ planId: string }>;
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const { planId } = use(params);

  /* Placeholder — in production, fetch plan from InsForge DB */
  const plan = null;

  if (!plan) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Campaign Plan</h1>
        </div>
        <SkeletonPlanTree />
      </div>
    );
  }

  return (
    <PlanView
      plan={plan}
      onApprove={(nodeId, nodeType) => {
        /* Mark node as approved in DB */
      }}
      onRegenerate={(nodeId, nodeType, guidance) => {
        /* Regenerate specific node via AI */
      }}
      onRegenerateAll={() => {
        /* Regenerate entire plan */
      }}
      onExportPdf={() => {
        /* Trigger PDF generation edge function */
      }}
    />
  );
}
