/**
 * Progress bar component for multi-step flows.
 *
 * @component ProgressBar
 */

interface ProgressBarProps {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Optional label for the current step */
  label?: string;
}

export function ProgressBar({ currentStep, totalSteps, label }: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-label">
        <span>{label ?? `Step ${currentStep} of ${totalSteps}`}</span>
        <span>
          {currentStep === totalSteps ? 'Almost done!' : `${percentage}%`}
        </span>
      </div>
      <div className="progress-bar-track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
