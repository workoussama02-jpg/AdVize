/**
 * ai-campaign-plan
 * Generates a complete Meta campaign plan from a brief.
 * Streams the response using Server-Sent Events.
 * Body: { brief: object, business_context: object, website_data?: string }
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const AI_BASE_URL = Deno.env.get('INSFORGE_BASE_URL') ?? '';
  const AI_KEY = Deno.env.get('ANON_KEY') ?? '';

  let body: {
    brief?: Record<string, unknown>;
    business_context?: Record<string, unknown>;
    website_data?: string;
  };
  try {
    body = await req.json() as typeof body;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { brief, business_context, website_data } = body;
  if (!brief) {
    return new Response(
      JSON.stringify({ error: 'brief is required' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const systemPrompt = `You are AdVize, an expert Meta Ads strategist. Generate a complete, production-ready campaign plan.

Apply these frameworks:
- PAS, BAB, AIDA, Social Proof Lead for ad copy
- Paradox of Choice: recommend ONE best option, max 3 variations ranked
- Budget split: 70% proven / 30% testing
- Retargeting windows: Hot 1-7d, Warm 7-30d, Cold 30-90d
- Naming convention: META_[Objective]_[Audience]_[Offer]_[DateCode]
- Always include exclusion audiences
- Primary text: 125-150 chars, Headlines: 40 chars max, Descriptions: 30 chars max
- Comply with Meta Ad Standards

Return ONLY valid JSON in this exact shape:
{
  "title": "<plan title>",
  "strategy_summary": "<2-3 sentence overall strategy>",
  "campaigns": [
    {
      "campaign_name": "<META_naming_convention>",
      "objective": "<AWARENESS|TRAFFIC|ENGAGEMENT|LEADS|APP_PROMOTION|SALES>",
      "strategy_type": "<prospecting|retargeting|retention>",
      "budget_allocation": <percentage as decimal e.g. 0.70>,
      "optimization_event": "<event name>",
      "adsets": [
        {
          "adset_name": "<name>",
          "audience_definition": {
            "type": "<interest|lookalike|custom|broad>",
            "description": "<audience description>",
            "age_range": "<18-35>",
            "interests": ["<interest1>"],
            "exclusions": ["<exclusion1>"]
          },
          "placements": ["<Feed>", "<Stories>", "<Reels>"],
          "retargeting_window": "<null or 1-7d|7-30d|30-90d>",
          "budget_split": <decimal>,
          "ads": [
            {
              "ad_name": "<name>",
              "format": "<Single Image|Carousel|Video|Collection>",
              "copy_framework": "<PAS|BAB|AIDA|Social Proof Lead>",
              "primary_texts": [
                { "text": "<ad copy>", "rank": 1, "is_recommended": true },
                { "text": "<variation>", "rank": 2, "is_recommended": false }
              ],
              "headlines": [
                { "text": "<headline>", "rank": 1, "is_recommended": true }
              ],
              "descriptions": [
                { "text": "<description>", "rank": 1, "is_recommended": true }
              ],
              "cta_button": "<LEARN_MORE|SHOP_NOW|SIGN_UP|GET_QUOTE>",
              "media_recommendation": {
                "type": "<image|video>",
                "aspect_ratio": "<1:1|4:5|9:16>",
                "description": "<visual description>",
                "key_elements": ["<element1>"]
              },
              "is_recommended": true
            }
          ]
        }
      ]
    }
  ]
}`;

  const userMessage = `Campaign Brief:
${JSON.stringify(brief, null, 2)}

Business Context:
${JSON.stringify(business_context ?? {}, null, 2)}${website_data ? `\n\nWebsite Data:\n${website_data}` : ''}`;

  try {
    const res = await fetch(`${AI_BASE_URL}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 8000,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: { message: string } };
      return new Response(
        JSON.stringify({ error: err.error?.message ?? 'AI error' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // Pass through the SSE stream directly to the client
    return new Response(res.body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
