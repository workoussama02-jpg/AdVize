/**
 * Campaign builder page — brief form → AI generates campaign plan.
 * PRD Section 6.5.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BriefForm } from '@/components/builder/BriefForm';
import { SkeletonPlanTree } from '@/components/ui/Skeleton';
import { useAIStream } from '@/hooks/useAIStream';

export default function BuilderPage() {
  const router = useRouter();
  const { content, isStreaming, error, elapsedTime, startStream, reset } = useAIStream();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (brief: {
    promotion: string;
    objective: string;
    ideal_customer: string;
    daily_budget: number;
    special_requirements?: string;
  }) => {
    setIsGenerating(true);

    await startStream('/api/ai/campaign-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });

    setIsGenerating(false);
  };

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

      {!isStreaming && !content && !error && (
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

      {error && (
        <div className="card">
          <p className="auth-error" role="alert">{error}</p>
          <Button variant="secondary" onClick={reset} id="builder-retry">
            Try Again
          </Button>
        </div>
      )}

      {content && !isStreaming && (
        <div className="card">
          <p className="page-subtitle">
            Your campaign plan has been generated. Redirecting...
          </p>
        </div>
      )}
    </div>
  );
}
