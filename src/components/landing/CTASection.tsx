/**
 * Landing page CTA section component.
 *
 * @component CTASection
 */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="landing-section reveal">
      <div className="cta-section">
        <h2 className="cta-section-title">Stop Guessing. Start Planning.</h2>
        <p className="cta-section-subtitle">
          Your next high-performing campaign is one click away.
        </p>
        <Link href="/login" className="btn-cta" id="cta-create-plan">
          Create Your First Campaign Plan
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
