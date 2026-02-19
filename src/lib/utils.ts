/**
 * Utility functions for AdVize.
 *
 * @module utils
 */

/**
 * Formats a date using the user's locale with Intl.DateTimeFormat.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Formats a monetary value using Intl.NumberFormat.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with proper grouping.
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Formats a percentage value.
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Returns a relative time string ("2 hours ago", "just now").
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateObj);
}

/**
 * Generates a unique ID for elements.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Maps a campaign plan status to its display label.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    approved: 'Approved',
    exported: 'Exported',
    archived: 'Archived',
  };
  return labels[status] ?? status;
}

/**
 * Maps a campaign plan status to its CSS class.
 */
export function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    draft: 'status-draft',
    approved: 'status-approved',
    exported: 'status-exported',
    archived: 'status-archived',
  };
  return classes[status] ?? 'badge-neutral';
}

/**
 * Truncates text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function to limit rapid calls.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Calculates a health score color based on the numeric value.
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--error)';
}

/**
 * Returns the appropriate severity class for a recommendation.
 */
export function getSeverityClass(severity: string): string {
  const classes: Record<string, string> = {
    critical: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    good: 'badge-success',
  };
  return classes[severity] ?? 'badge-neutral';
}
