/**
 * Metric card — displays a single campaign metric with label.
 * PRD Section 6.6.1.
 *
 * @component MetricCard
 */

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
}

export function MetricCard({ label, value, subValue }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
      {subValue && (
        <span className="metric-label">{subValue}</span>
      )}
    </div>
  );
}
