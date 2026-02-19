/**
 * Landing page "Why AdVize" differentiators section.
 *
 * @component Differentiators
 */
import { UserCheck, Brain, Layers, Globe } from 'lucide-react';

/** Differentiator data from the PRD */
const DIFFS = [
  {
    icon: UserCheck,
    title: 'You Stay in Control',
    text: 'No automation, no black boxes. You review every decision and implement it yourself. You learn by doing.',
  },
  {
    icon: Brain,
    title: 'Psychology-Backed Copy',
    text: 'Ad copy generated using proven frameworks — PAS, BAB, Loss Aversion, Social Proof — not generic AI text.',
  },
  {
    icon: Layers,
    title: 'Complete Architecture, Not Just Copy',
    text: 'Other tools write ads. AdVize plans entire campaigns — objectives, audiences, budget splits, naming conventions, and copy.',
  },
  {
    icon: Globe,
    title: 'Website-Aware AI',
    text: 'Connect your website and AdVize personalizes everything — copy, offers, audiences — based on your actual products and services.',
  },
];

export function Differentiators() {
  return (
    <section id="why-advize" className="landing-section">
      <div className="landing-section-header reveal">
        <p className="landing-section-eyebrow">Why AdVize</p>
        <h2 className="landing-section-title">Built Different. Built Better.</h2>
        <p className="landing-section-subtitle">
          AdVize isn&apos;t another ad copy generator. It&apos;s a complete campaign strategist powered by AI.
        </p>
      </div>

      <div className="diff-grid">
        {DIFFS.map((diff) => {
          const Icon = diff.icon;
          return (
            <div key={diff.title} className="diff-card reveal" id={`diff-${diff.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="diff-card-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="diff-card-title">{diff.title}</h3>
              <p className="diff-card-text">{diff.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
