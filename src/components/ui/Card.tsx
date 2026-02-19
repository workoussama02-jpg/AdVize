/**
 * Card component for content blocks.
 *
 * @component Card
 */
import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the card has hover interaction */
  hoverable?: boolean;
  /** Card contents */
  children: ReactNode;
}

export function Card({ hoverable = false, children, className = '', ...props }: CardProps) {
  const hoverClass = hoverable ? 'card-hover' : '';

  return (
    <div className={`card ${hoverClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
