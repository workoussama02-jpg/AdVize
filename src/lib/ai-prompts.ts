/**
 * AI prompt templates for AdVize.
 * All system prompts are centralized here — never scatter prompts across files.
 *
 * @module ai-prompts
 */

/** AI model identifiers per task */
export const AI_MODELS = {
  STRATEGY: 'xAI/Grok-4.1-Fast',
  COPY: 'xAI/Grok-4.1-Fast',
  ANALYSIS: 'google/gemini-2.5-flash',
  EXTRACTION: 'google/gemini-2.5-flash',
} as const;

/** User context injected into every AI call */
interface UserContext {
  businessName: string;
  industry: string;
  dailyBudget: number;
  websiteData?: string;
  previousCampaigns?: string;
}

/** Layer 1 — Role prompt */
const ROLE_PROMPT = `You are AdVize, an expert Meta ads strategist specializing in campaign architecture, ad copywriting, and performance optimization. You provide structured, actionable advice based on proven marketing frameworks and Meta Ads best practices.`;

/** Layer 2 — Marketing psychology prompt */
const PSYCHOLOGY_PROMPT = `Apply these frameworks in all suggestions:
- PAS (Problem-Agitate-Solve), BAB (Before-After-Bridge), Social Proof Lead, AIDA (Attention-Interest-Desire-Action), Loss Aversion for ad copy
- Paradox of Choice: recommend ONE best option among variations
- Anchoring: show benchmarks before user metrics
- Social Proof: suggest including customer numbers when available
- Loss Aversion: generate loss-framed alongside gain-framed copy
- Hick's Law: generate exactly 3 variations max, rank them, recommend one`;

/** Layer 3 — Paid ads best practices prompt */
const BEST_PRACTICES_PROMPT = `Follow these Meta Ads rules:
- Naming convention: META_[Objective]_[Audience]_[Offer]_[DateCode]
- Budget split: 70% proven / 30% testing for new campaigns
- Retargeting windows: Hot 1-7d, Warm 7-30d, Cold 30-90d
- Always suggest exclusion audiences
- Creative testing priority: Concept → Hook → Visual → Copy → CTA
- Include placement recommendations per ad format
- Always include a clear CTA
- Ad copy length: Primary text 125-150 chars, Headlines 40 chars max, Descriptions 30 chars max
- Comply with Meta Ad Standards — no misleading claims, no prohibited content`;

/**
 * Builds the Layer 4 — User context prompt.
 */
function buildUserContextPrompt(context: UserContext): string {
  let prompt = `User Context:
- Business: ${context.businessName}
- Industry: ${context.industry}
- Daily Budget: $${context.dailyBudget}`;

  if (context.websiteData) {
    prompt += `\n- Website Data: ${context.websiteData}`;
  }

  if (context.previousCampaigns) {
    prompt += `\n- Previous Campaigns: ${context.previousCampaigns}`;
  }

  return prompt;
}

/**
 * Builds the full system prompt with all 4 layers.
 */
export function buildSystemPrompt(context: UserContext): string {
  return [
    ROLE_PROMPT,
    '',
    PSYCHOLOGY_PROMPT,
    '',
    BEST_PRACTICES_PROMPT,
    '',
    buildUserContextPrompt(context),
  ].join('\n');
}

/**
 * Builds the campaign plan generation prompt.
 * User brief is passed as a separate user message — NEVER concatenated into system prompt.
 */
export function buildCampaignPlanUserPrompt(brief: {
  promotion: string;
  objective: string;
  idealCustomer: string;
  dailyBudget: number;
  specialRequirements?: string;
}): string {
  return `Generate a complete campaign plan for the following brief:

**What I'm promoting:** ${brief.promotion}
**Campaign goal:** ${brief.objective}
**Ideal customer:** ${brief.idealCustomer}
**Daily budget:** $${brief.dailyBudget}
${brief.specialRequirements ? `**Special requirements:** ${brief.specialRequirements}` : ''}

Return the plan as a valid JSON object with this exact structure:
{
  "campaigns": [
    {
      "campaign_name": "META_[Objective]_[Audience]_[Offer]_[DateCode]",
      "objective": "Awareness | Traffic | Engagement | Leads | Sales",
      "strategy_type": "Retargeting | Lookalike | Cold | Warming | Funnel",
      "budget_allocation": 100,
      "optimization_event": "Purchase | Lead | AddToCart | ViewContent | LinkClick",
      "ad_sets": [
        {
          "adset_name": "string",
          "audience": {
            "type": "Interest | Lookalike | Custom | Retargeting",
            "demographics": { "age_min": 18, "age_max": 65, "gender": "All", "locations": ["US"] },
            "interests": ["string"],
            "behaviors": ["string"],
            "exclusions": ["string"]
          },
          "placements": "Automatic | Manual",
          "retargeting_window": "Hot 1-7d | Warm 7-30d | Cold 30-90d | null",
          "budget_split": 70,
          "ads": [
            {
              "ad_name": "string",
              "format": "Single Image | Carousel | Video | Collection",
              "primary_texts": [
                { "text": "string", "rank": 1, "is_recommended": true },
                { "text": "string", "rank": 2, "is_recommended": false },
                { "text": "string", "rank": 3, "is_recommended": false }
              ],
              "headlines": [
                { "text": "string", "rank": 1, "is_recommended": true },
                { "text": "string", "rank": 2, "is_recommended": false },
                { "text": "string", "rank": 3, "is_recommended": false }
              ],
              "descriptions": [
                { "text": "string", "rank": 1, "is_recommended": true },
                { "text": "string", "rank": 2, "is_recommended": false },
                { "text": "string", "rank": 3, "is_recommended": false }
              ],
              "cta_button": "Shop Now | Learn More | Sign Up | Get Offer | Book Now | Contact Us",
              "copy_framework": "PAS | BAB | Social Proof Lead | AIDA | Loss Aversion",
              "media_recommendation": { "type": "Single Image | Carousel | Video", "description": "string" }
            }
          ]
        }
      ]
    }
  ]
}

Generate 1-2 campaigns with 1-3 ad sets each and 2-3 ads per ad set. Each ad must have exactly 3 variations for primary text, headline, and description. Rank them and mark one as recommended. Label the copy framework used.`;
}

/**
 * Builds the campaign analysis prompt.
 * Raw metrics are passed as a separate user message — NEVER concatenated into system prompt.
 */
export function buildAnalysisUserPrompt(campaignData: {
  campaignName: string;
  metrics: Record<string, unknown>;
}): string {
  return `Analyze this Meta campaign's performance and provide actionable recommendations.

**Campaign:** ${campaignData.campaignName}
**Raw Metrics:** ${JSON.stringify(campaignData.metrics, null, 2)}

Return the analysis as a valid JSON object with this exact structure:
{
  "health_score": 0-100,
  "whats_working": [
    { "metric": "string", "value": "string", "benchmark": "string", "assessment": "string" }
  ],
  "issues": [
    {
      "severity": "critical | warning | info",
      "title": "string",
      "data": "string",
      "root_cause": "string",
      "recommendation": "string",
      "expected_impact": "string"
    }
  ],
  "quick_wins": [
    { "action": "string", "reason": "string" }
  ]
}

Include industry-standard benchmarks for comparison. Order issues by impact (highest first). Provide specific, actionable recommendations.`;
}

/**
 * Builds the website extraction prompt.
 */
export function buildExtractionPrompt(htmlContent: string): string {
  return `Extract structured marketing data from this HTML content. Focus on information useful for ad campaigns.

Return the data as a valid JSON object:
{
  "business_name": "string",
  "description": "string",
  "products_services": [
    { "name": "string", "description": "string", "price": "string | null" }
  ],
  "unique_selling_points": ["string"],
  "testimonials": [
    { "text": "string", "author": "string | null" }
  ],
  "images": [
    { "url": "string", "alt": "string", "context": "product | hero | lifestyle | testimonial" }
  ]
}

HTML Content (truncated to first 50000 chars):
${htmlContent.slice(0, 50000)}`;
}

/**
 * Builds a regeneration prompt for a specific section.
 */
export function buildRegenerationPrompt(
  section: string,
  currentContent: string,
  guidance?: string
): string {
  let prompt = `Regenerate the following ${section} section. Keep the same JSON structure and format.

Current content:
${currentContent}`;

  if (guidance) {
    prompt += `\n\nUser guidance for regeneration: ${guidance}`;
  }

  prompt += '\n\nReturn only the regenerated JSON for this section, maintaining the same structure.';

  return prompt;
}
