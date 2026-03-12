/**
 * POST /api/ai/campaign-plan
 * Accepts a campaign brief, builds the AI prompt, and streams the response
 * from the InsForge AI Gateway back to the client as Server-Sent Events.
 */
import { cookies } from 'next/headers';
import { buildSystemPrompt, buildCampaignPlanUserPrompt, AI_MODELS } from '@/lib/ai-prompts';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      promotion?: string;
      objective?: string;
      ideal_customer?: string;
      daily_budget?: number;
      special_requirements?: string;
    };

    const { promotion, objective, ideal_customer, daily_budget, special_requirements } = body;

    if (!promotion || !objective || !ideal_customer || !daily_budget) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prefer the user's access token from httpOnly cookie; fall back to anon key.
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value ?? INSFORGE_ANON_KEY;

    const systemPrompt = buildSystemPrompt({
      businessName: 'Your Business',
      industry: 'General',
      dailyBudget: daily_budget,
    });

    const userPrompt = buildCampaignPlanUserPrompt({
      promotion,
      objective,
      idealCustomer: ideal_customer,
      dailyBudget: daily_budget,
      specialRequirements: special_requirements,
    });

    const aiRes = await fetch(`${INSFORGE_URL}/api/ai/chat/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        model: AI_MODELS.STRATEGY,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 8000,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pipe the SSE stream directly to the client.
    return new Response(aiRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
