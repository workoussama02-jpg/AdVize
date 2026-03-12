/**
 * scrape-website
 * Scrapes a user-provided URL and extracts structured data for AI context injection.
 * Only runs with explicit user consent (scrape_consent = true).
 * Body: { url: string }
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

  let body: { url?: string };
  try {
    body = await req.json() as { url?: string };
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { url } = body;
  if (!url) {
    return new Response(
      JSON.stringify({ error: 'url is required' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Validate URL — must be HTTPS
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid URL' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  if (parsed.protocol !== 'https:') {
    return new Response(
      JSON.stringify({ error: 'Only HTTPS URLs are allowed' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Block private/internal IPs (SSRF prevention)
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  const privateRanges = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
  if (blockedHosts.includes(parsed.hostname) || privateRanges.test(parsed.hostname)) {
    return new Response(
      JSON.stringify({ error: 'Internal URLs are not allowed' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const pageRes = await fetch(parsed.toString(), {
      headers: { 'User-Agent': 'AdVize-Bot/1.0 (internal tool)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!pageRes.ok) {
      return new Response(
        JSON.stringify({ error: `Page returned ${pageRes.status}` }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const html = await pageRes.text();

    // Strip HTML tags and collapse whitespace for a clean text extract
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000); // cap at 8k chars to keep AI context reasonable

    // Extract title and meta description
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i);

    return new Response(
      JSON.stringify({
        url: parsed.toString(),
        title: titleMatch?.[1]?.trim() ?? '',
        description: descMatch?.[1]?.trim() ?? '',
        text,
        scraped_at: new Date().toISOString(),
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
