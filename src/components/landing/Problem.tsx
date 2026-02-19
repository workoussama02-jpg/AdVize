/**
 * Landing page "Problem" section component.
 *
 * @component Problem
 */
import { Shuffle, Clock, HelpCircle } from 'lucide-react';

/** Problem card data */
const PROBLEMS = [
  {
    icon: Shuffle,
    title: 'Campaign Structure is Guesswork',
    text: 'Objectives, audiences, placements, budget splits — there are dozens of decisions before you even write an ad. Most get it wrong.',
  },
  {
    icon: Clock,
    title: 'Writing Ads is Tedious',
    text: 'You need 3-5 copy variations per ad, tested against proven frameworks. That\'s hours of writing for a single campaign.',
  },
  {
    icon: HelpCircle,
    title: 'Diagnosing Problems is Slow',
    text: 'Your CPA is too high. Is it the audience? The creative? The landing page? Without data-driven analysis, you\'re guessing.',
  },
];

export function Problem() {
  return (
    <section className="landing-section">
      <div className="landing-section-header reveal">
        <p className="landing-section-eyebrow">The Problem</p>
        <h2 className="landing-section-title">The Problem with Running Meta Ads</h2>
        <p className="landing-section-subtitle">
          Creating effective campaigns requires expertise that takes years to build. 
          Without it, budgets are wasted and growth stalls.
        </p>
      </div>

      <div className="problem-cards">
        {PROBLEMS.map((problem) => {
          const Icon = problem.icon;
          return (
            <div key={problem.title} className="problem-card reveal" id={`problem-${problem.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="problem-card-icon">
                <Icon size={24} aria-hidden="true" />
              </div>
              <h3 className="problem-card-title">{problem.title}</h3>
              <p className="problem-card-text">{problem.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
