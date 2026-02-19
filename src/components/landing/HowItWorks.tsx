/**
 * Landing page "How It Works" section component.
 *
 * @component HowItWorks
 */

/** Step data from the PRD */
const STEPS = [
  {
    number: 1,
    title: 'Describe Your Campaign',
    text: 'Tell us what you\'re promoting, your budget, and your ideal customer.',
  },
  {
    number: 2,
    title: 'AI Generates Your Plan',
    text: 'AdVize creates a complete campaign structure with strategy, audiences, and ad copy variations.',
  },
  {
    number: 3,
    title: 'Review & Refine',
    text: 'Approve, edit, or regenerate any section. You\'re always in control.',
  },
  {
    number: 4,
    title: 'Export & Implement',
    text: 'Download your PDF guide and set up the campaign in Meta Ads Manager.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section">
      <div className="landing-section-header reveal">
        <p className="landing-section-eyebrow">How It Works</p>
        <h2 className="landing-section-title">From Brief to Campaign in 4 Steps</h2>
        <p className="landing-section-subtitle">
          No complexity, no learning curve. Just describe what you need and let AdVize do the heavy lifting.
        </p>
      </div>

      <div className="steps-grid">
        {STEPS.map((step) => (
          <div key={step.number} className="step-card reveal" id={`step-${step.number}`}>
            <div className="step-number">{step.number}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-text">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
