/**
 * ai-analyze-campaign
 * Runs AI analysis on raw Meta campaign metrics.
 * Returns a health score, diagnosis, and ranked recommendations.
 * Body: { metrics: object, business_context: object }
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
  const AI_KEY = Deno.env.get('ANON_KEY') ?? ''

  let body: { metrics?: Record<string, unknown>; business_context?: Record<string, unknown> };
  try {
    body = await req.json() as typeof body;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { metrics, business_context } = body;
  if (!metrics) {
    return new Response(
      JSON.stringify({ error: 'metrics is required' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const systemPrompt = `You are AdVize, an expert Meta Ads analyst. Analyze the provided campaign metrics and return a structured JSON response.

Apply these diagnostic frameworks:
- Compare CTR, CPC, CPA against industry benchmarks
- Identify budget efficiency issues (high CPM, low relevance)
- Spot audience fatigue signals (rising frequency, falling CTR)
- Evaluate creative performance (CTR spread, hook rate)
- Flag structural issues (budget distribution, objective mismatch)

Return ONLY valid JSON in this exact shape:
{
  "health_score": <integer 0-100>,
  "diagnosis": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": [
    {
      "severity": "critical|warning|info",
      "metric": "<metric name>",
      "finding": "<what's wrong>",
      "benchmark": "<industry benchmark>"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "action": "<specific action>",
      "rationale": "<why this will help>",
      "expected_impact": "<measurable outcome>"
    }
  ]
}`;

  const userMessage = `Campaign Metrics:
${JSON.stringify(metrics, null, 2)}

Business Context:
${JSON.stringify(business_context ?? {}, null, 2)}`;

  try {
    const res = await fetch(`${AI_BASE_URL}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const json = await res.json() as {
      choices?: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (!res.ok || json.error) {
      return new Response(
        JSON.stringify({ error: json.error?.message ?? 'AI error' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const content = json.choices?.[0]?.message?.content ?? '{}';
    // Strip markdown code fences if present
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned) as Record<string, unknown>;

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
