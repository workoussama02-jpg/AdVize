/**
 * meta-fetch-campaigns
 * Fetches all campaigns for the configured Meta ad account.
 * Uses a System User Token stored as an InsForge Secret — never exposed to frontend.
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
  const AD_ACCOUNT_ID = Deno.env.get('META_AD_ACCOUNT_ID');

  if (!META_TOKEN || !AD_ACCOUNT_ID) {
    return new Response(
      JSON.stringify({ error: 'Meta credentials not configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const fields = 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time';
  const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/campaigns?fields=${fields}&access_token=${META_TOKEN}`;

  try {
    const res = await fetch(url);
    const json = await res.json() as { data?: unknown[]; error?: { message: string } };

    if (!res.ok || json.error) {
      return new Response(
        JSON.stringify({ error: json.error?.message ?? 'Meta API error' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ campaigns: json.data ?? [] }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
