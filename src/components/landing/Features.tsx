/**
 * Landing page Features section component.
 *
 * @component Features
 */
import { PenTool, BarChart3, FileDown } from 'lucide-react';

/** Feature data */
const FEATURES = [
  {
    icon: PenTool,
    title: 'Complete Campaign Plans in Minutes',
    description:
      'Tell AdVize what you\'re promoting and who you\'re targeting. Get a full campaign architecture — objectives, audiences, ad sets, copy variations — ready to implement.',
    visual: 'Campaign Builder Preview',
    reverse: false,
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Performance Diagnosis',
    description:
      'Connect your Meta account. AdVize pulls your campaign data, identifies what\'s working and what isn\'t, and gives you specific, actionable recommendations.',
    visual: 'Campaign Analyzer Preview',
    reverse: true,
  },
  {
    icon: FileDown,
    title: 'Step-by-Step Implementation Guide',
    description:
      'Export your campaign plan as a detailed PDF guide. Follow the steps in Ads Manager — no confusion, no missed settings.',
    visual: 'PDF Export Preview',
    reverse: false,
  },
];

export function Features() {
  return (
    <section id="features" className="landing-section">
      <div className="landing-section-header reveal">
        <p className="landing-section-eyebrow">Features</p>
        <h2 className="landing-section-title">Everything You Need to Plan Better Campaigns</h2>
        <p className="landing-section-subtitle">
          From strategy to execution — AdVize handles the planning so you can focus on results.
        </p>
      </div>

      <div className="feature-blocks">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`feature-block reveal ${feature.reverse ? 'reverse' : ''}`}
              id={`feature-block-${index}`}
            >
              <div className="feature-block-content">
                <div className="feature-block-icon">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-block-title">{feature.title}</h3>
                <p className="feature-block-description">{feature.description}</p>
              </div>
              <div className="feature-block-visual">{feature.visual}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
