/**
 * meta-fetch-insights
 * Fetches detailed performance insights for a single campaign.
 * Body: { campaign_id: string, date_preset?: string }
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

  const META_TOKEN = Deno.env.get('META_SYSTEM_USER_TOKEN');

  if (!META_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'Meta credentials not configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  let body: { campaign_id?: string; date_preset?: string };
  try {
    body = await req.json() as { campaign_id?: string; date_preset?: string };
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { campaign_id, date_preset = 'last_30d' } = body;

  if (!campaign_id) {
    return new Response(
      JSON.stringify({ error: 'campaign_id is required' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const fields = [
    'campaign_id', 'campaign_name', 'spend', 'impressions', 'reach',
    'frequency', 'ctr', 'cpc', 'cpm', 'clicks', 'unique_clicks',
    'conversions', 'cost_per_result', 'purchase_roas',
    'date_start', 'date_stop',
  ].join(',');

  const baseUrl = `https://graph.facebook.com/v19.0/${campaign_id}/insights`;

  try {
    // Main metrics
    const mainParams = new URLSearchParams({ fields, date_preset, access_token: META_TOKEN });
    const res = await fetch(`${baseUrl}?${mainParams}`);
    const json = await res.json() as { data?: Record<string, unknown>[]; error?: { message: string } };

    if (!res.ok || json.error) {
      return new Response(
        JSON.stringify({ error: json.error?.message ?? 'Meta API error' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const metrics = json.data?.[0] ?? {};

    // Age/gender breakdown
    const breakdownParams = new URLSearchParams({
      fields: 'impressions,clicks',
      breakdowns: 'age,gender',
      date_preset,
      access_token: META_TOKEN,
    });
    const breakdownRes = await fetch(`${baseUrl}?${breakdownParams}`);
    const breakdownJson = await breakdownRes.json() as { data?: unknown[] };

    // Placement breakdown
    const placementParams = new URLSearchParams({
      fields: 'impressions,clicks,spend',
      breakdowns: 'publisher_platform',
      date_preset,
      access_token: META_TOKEN,
    });
    const placementRes = await fetch(`${baseUrl}?${placementParams}`);
    const placementJson = await placementRes.json() as { data?: unknown[] };

    return new Response(
      JSON.stringify({
        ...metrics,
        roas: (metrics.purchase_roas as Array<{ value: string }>)?.[0]?.value ?? '0',
        age_gender_breakdown: breakdownJson.data ?? [],
        placement_breakdown: placementJson.data ?? [],
      }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
