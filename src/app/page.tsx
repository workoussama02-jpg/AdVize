/**
 * AdVize Landing Page — the public-facing entry point.
 * Uses light mode colors and showcases the value proposition.
 */
import '@/styles/landing.css';

import { Navbar } from '@/components/shared/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Differentiators } from '@/components/landing/Differentiators';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Differentiators />
        <CTASection />
      </main>
      <Footer />
      <ScrollReveal />
    </div>
  );
}
