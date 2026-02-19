/**
 * Onboarding wizard page — progressive disclosure, one question per step.
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, ArrowLeft, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { businessProfileSchema, INDUSTRY_OPTIONS } from '@/lib/validators';

/** Total number of onboarding steps */
const TOTAL_STEPS = 6;

/** Budget preset chips */
const BUDGET_PRESETS = [5, 10, 20, 50, 100];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [dailyBudget, setDailyBudget] = useState<number>(20);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapeConsent, setScrapeConsent] = useState(false);

  const goNext = () => {
    setErrors({});
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const goBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
  };

  const validateAndNext = useCallback(() => {
    const fieldErrors: Record<string, string> = {};

    if (step === 1 && !businessName.trim()) {
      fieldErrors.business_name = 'Business name is required';
    }
    if (step === 2 && !industry) {
      fieldErrors.industry = 'Please select an industry';
    }
    if (step === 3 && (dailyBudget < 1 || dailyBudget > 10000)) {
      fieldErrors.daily_budget = 'Budget must be between $1 and $10,000';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    goNext();
  }, [step, businessName, industry, dailyBudget]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    setErrors({});

    const result = businessProfileSchema.safeParse({
      business_name: businessName,
      industry,
      daily_budget: dailyBudget,
      website_url: websiteUrl || undefined,
      scrape_consent: scrapeConsent,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="centered-page">
      <div className="centered-card-wide">
        {/* Logo */}
        <div className="onboarding-logo">
          <Zap size={32} className="onboarding-logo-icon" aria-hidden="true" />
          <p className="onboarding-logo-text">
            Let&apos;s set up your AdVize profile
          </p>
        </div>

        {/* Progress */}
        <div className="onboarding-progress">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Steps */}
        <div className="card">
          {/* Step 1: Business Name */}
          {step === 1 && (
            <div>
              <h2 className="onboarding-step-title">
                What&apos;s your business name?
              </h2>
              <Input
                inputId="onboarding-business-name"
                placeholder="e.g. Acme Coffee Co."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                error={errors.business_name}
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Industry */}
          {step === 2 && (
            <div>
              <h2 className="onboarding-step-title">
                What industry are you in?
              </h2>
              <Select
                inputId="onboarding-industry"
                options={INDUSTRY_OPTIONS.map((ind) => ({ value: ind, label: ind }))}
                value={industry}
                onChange={(e) => setIndustry((e.target as HTMLSelectElement).value)}
                error={errors.industry}
              />
            </div>
          )}

          {/* Step 3: Daily Budget */}
          {step === 3 && (
            <div>
              <h2 className="onboarding-step-title">
                What&apos;s your daily ad budget?
              </h2>
              <div className="onboarding-budget-chips">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    className={`btn onboarding-budget-chip ${dailyBudget === preset ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDailyBudget(preset)}
                    id={`budget-preset-${preset}`}
                  >
                    ${preset}
                  </button>
                ))}
                <button
                  className={`btn onboarding-budget-chip ${!BUDGET_PRESETS.includes(dailyBudget) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDailyBudget(0)}
                  id="budget-preset-custom"
                >
                  Custom
                </button>
              </div>
              <Input
                inputId="onboarding-budget"
                type="number"
                placeholder="Enter amount..."
                value={dailyBudget || ''}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                error={errors.daily_budget}
                min={1}
                max={10000}
                step={0.01}
              />
            </div>
          )}

          {/* Step 4: Website */}
          {step === 4 && (
            <div>
              <h2 className="onboarding-step-title">Got a website?</h2>
              <p className="onboarding-step-subtitle">
                We&apos;ll analyze your website to personalize campaign suggestions. This is optional.
              </p>
              <Input
                inputId="onboarding-website"
                type="url"
                placeholder="https://yourbusiness.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                error={errors.website_url}
              />
              {websiteUrl && (
                <label className="checkbox-group onboarding-consent-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={scrapeConsent}
                    onChange={(e) => setScrapeConsent(e.target.checked)}
                    id="onboarding-scrape-consent"
                  />
                  <span className="onboarding-consent-text">
                    I consent to AdVize analyzing my website content
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Step 5: Connect Meta */}
          {step === 5 && (
            <div className="onboarding-connect-section">
              <h2 className="onboarding-step-title">
                Connect your Meta ad account
              </h2>
              <p className="onboarding-step-subtitle">
                This lets AdVize analyze your existing campaigns. You can skip this and connect later.
              </p>
              <Button variant="secondary" size="lg" id="onboarding-connect-meta">
                <Globe size={20} aria-hidden="true" />
                Connect Meta Account
              </Button>
              <p className="onboarding-connect-note">
                Read-only access only. We never modify your campaigns.
              </p>
            </div>
          )}

          {/* Step 6: Summary */}
          {step === 6 && (
            <div>
              <h2 className="onboarding-step-title">Here&apos;s your profile</h2>
              <div className="onboarding-summary">
                <div className="onboarding-summary-row">
                  <span className="onboarding-summary-label">Business</span>
                  <span className="onboarding-summary-value">{businessName}</span>
                </div>
                <div className="onboarding-summary-row">
                  <span className="onboarding-summary-label">Industry</span>
                  <span className="onboarding-summary-value">{industry}</span>
                </div>
                <div className="onboarding-summary-row">
                  <span className="onboarding-summary-label">Daily Budget</span>
                  <span className="onboarding-summary-value-mono">${dailyBudget}</span>
                </div>
                {websiteUrl && (
                  <div className="onboarding-summary-row">
                    <span className="onboarding-summary-label">Website</span>
                    <span className="onboarding-summary-value">{websiteUrl}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className={step > 1 ? 'onboarding-nav-spaced' : 'onboarding-nav'}>
            {step > 1 && (
              <Button variant="ghost" onClick={goBack} id="onboarding-back-btn">
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </Button>
            )}

            {step < TOTAL_STEPS ? (
              <Button
                variant="primary"
                onClick={step === 4 || step === 5 ? goNext : validateAndNext}
                id="onboarding-next-btn"
              >
                {step === 4 || step === 5 ? 'Skip' : 'Continue'}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinish}
                loading={isSubmitting}
                id="onboarding-finish-btn"
              >
                <Check size={16} aria-hidden="true" />
                Looks good!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
