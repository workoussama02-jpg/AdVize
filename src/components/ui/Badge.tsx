/**
 * Badge component for status indicators and labels.
 *
 * @component Badge
 */
import { type ReactNode } from 'react';

interface BadgeProps {
  /** Visual variant */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /** Badge contents */
  children: ReactNode;
  /** Additional CSS class */
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
