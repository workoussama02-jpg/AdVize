/**
 * Campaign brief form — collects user input for AI campaign plan generation.
 * PRD Section 6.5.1.
 *
 * @component BriefForm
 */
'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Users,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { campaignBriefSchema } from '@/lib/validators';

/** Campaign objective options mapped to Meta objectives */
const OBJECTIVES = [
  { value: 'Sales', label: 'Sales', icon: ShoppingBag },
  { value: 'Leads', label: 'Leads', icon: Users },
  { value: 'Awareness', label: 'Awareness', icon: Eye },
  { value: 'Traffic', label: 'Traffic', icon: MousePointerClick },
] as const;

interface BriefFormProps {
  defaultBudget?: number;
  onSubmit: (brief: BriefData) => void;
  isGenerating?: boolean;
}

interface BriefData {
  promotion: string;
  objective: string;
  ideal_customer: string;
  daily_budget: number;
  special_requirements?: string;
}

export function BriefForm({ defaultBudget = 20, onSubmit, isGenerating }: BriefFormProps) {
  const [productDescription, setProductDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(defaultBudget);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    setErrors({});

    const result = campaignBriefSchema.safeParse({
      promotion: productDescription,
      objective,
      ideal_customer: targetAudience,
      daily_budget: dailyBudget,
      special_requirements: specialRequirements || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form
      className="brief-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Textarea
        inputId="brief-product"
        label="What are you promoting?"
        placeholder="Describe your product, service, or offer in 2-3 sentences..."
        value={productDescription}
        onChange={(e) => setProductDescription(e.target.value)}
        error={errors.promotion}
      />

      <div className="input-group">
        <label className="input-label">What&apos;s the goal?</label>
        <div className="radio-cards">
          {OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            return (
              <label
                key={obj.value}
                className={`radio-card ${objective === obj.value ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="objective"
                  value={obj.value}
                  checked={objective === obj.value}
                  onChange={(e) => setObjective(e.target.value)}
                  id={`brief-objective-${obj.value.toLowerCase()}`}
                />
                <Icon size={24} className="radio-card-icon" aria-hidden="true" />
                <span className="radio-card-label">{obj.label}</span>
              </label>
            );
          })}
        </div>
        {errors.objective && (
          <span className="input-error-text">{errors.objective}</span>
        )}
      </div>

      <Textarea
        inputId="brief-audience"
        label="Who's the ideal customer?"
        placeholder="Describe demographics, interests, and behaviors of your target audience..."
        value={targetAudience}
        onChange={(e) => setTargetAudience(e.target.value)}
        error={errors.ideal_customer}
      />

      <Input
        inputId="brief-budget"
        label="Daily budget for this campaign"
        type="number"
        placeholder="20"
        value={dailyBudget}
        onChange={(e) => setDailyBudget(Number(e.target.value))}
        error={errors.daily_budget}
        min={1}
        max={10000}
        step={0.01}
      />

      <Textarea
        inputId="brief-requirements"
        label="Any special requirements?"
        placeholder="Seasonal offers, promo codes, specific angles... (optional)"
        value={specialRequirements}
        onChange={(e) => setSpecialRequirements(e.target.value)}
        error={errors.special_requirements}
      />

      <Button
        variant="primary"
        size="lg"
        loading={isGenerating}
        id="brief-submit"
        type="submit"
      >
        Generate Campaign Plan
      </Button>
    </form>
  );
}
