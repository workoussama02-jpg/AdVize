/**
 * Landing page Hero section component.
 *
 * @component Hero
 */
import Link from 'next/link';
import { ArrowRight, ArrowDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="hero landing-section">
      <div className="hero-badge">
        <Zap size={16} aria-hidden="true" />
        AI-Powered Meta Ads Strategy
      </div>

      <h1 className="hero-title">
        Your AI-Powered Meta Ads Strategist
      </h1>

      <p className="hero-subtitle">
        Generate complete campaign plans, get expert ad copy, and diagnose
        underperformance — all in minutes, not hours.
      </p>

      <div className="hero-actions">
        <Link href="/login" id="hero-get-started">
          <Button variant="primary" size="lg">
            Get Started Free
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </Link>
        <a href="#how-it-works" id="hero-see-how">
          <Button variant="secondary" size="lg">
            See How It Works
            <ArrowDown size={18} aria-hidden="true" />
          </Button>
        </a>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-placeholder">
          <Zap size={48} color="var(--brand-primary)" aria-hidden="true" />
          <span className="hero-visual-label">
            App Preview — Campaign Builder Interface
          </span>
        </div>
      </div>
    </section>
  );
}
