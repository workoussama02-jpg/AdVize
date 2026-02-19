/**
 * Health score display — large centered score with color coding.
 * PRD Section 6.6.3.
 *
 * @component HealthScore
 */

interface HealthScoreProps {
  score: number;
}

export function HealthScore({ score }: HealthScoreProps) {
  const getColorClass = () => {
    if (score >= 70) return 'health-good';
    if (score >= 40) return 'health-warning';
    return 'health-critical';
  };

  const getLabel = () => {
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="card health-score-display">
      <span className={`health-score-value ${getColorClass()}`}>{score}</span>
      <span className="health-score-label">Campaign Health Score — {getLabel()}</span>
    </div>
  );
}
