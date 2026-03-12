/**
 * generate-pdf
 * Converts a campaign plan into a structured HTML report and returns it as a PDF.
 * Uses the browser's print stylesheet approach via HTML response — client triggers print/save.
 * Body: { plan: object }
 *
 * Note: True server-side PDF generation requires a headless browser (Puppeteer/Playwright).
 * This function returns a fully styled HTML document that the client can print to PDF
 * via window.print() — no external dependency needed.
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

  let body: { plan?: Record<string, unknown> };
  try {
    body = await req.json() as typeof body;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { plan } = body;
  if (!plan) {
    return new Response(
      JSON.stringify({ error: 'plan is required' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const title = (plan.title as string) ?? 'Campaign Plan';
  const summary = (plan.strategy_summary as string) ?? '';
  const campaigns = (plan.campaigns as Array<Record<string, unknown>>) ?? [];

  const campaignsHtml = campaigns.map((campaign) => {
    const adsets = (campaign.adsets as Array<Record<string, unknown>>) ?? [];
    const adsetsHtml = adsets.map((adset) => {
      const ads = (adset.ads as Array<Record<string, unknown>>) ?? [];
      const adsHtml = ads
        .filter((ad) => ad.is_recommended)
        .map((ad) => {
          const texts = (ad.primary_texts as Array<{ text: string; is_recommended: boolean }>) ?? [];
          const recommended = texts.find((t) => t.is_recommended)?.text ?? texts[0]?.text ?? '';
          const headlines = (ad.headlines as Array<{ text: string }>) ?? [];
          return `
            <div class="ad">
              <div class="ad-name">${ad.ad_name ?? ''} <span class="badge">${ad.format ?? ''}</span></div>
              <div class="field"><span class="label">Framework:</span> ${ad.copy_framework ?? ''}</div>
              <div class="field"><span class="label">Primary Text:</span> ${recommended}</div>
              <div class="field"><span class="label">Headline:</span> ${headlines[0]?.text ?? ''}</div>
              <div class="field"><span class="label">CTA:</span> ${ad.cta_button ?? ''}</div>
            </div>`;
        }).join('');
      const audience = adset.audience_definition as Record<string, unknown> ?? {};
      return `
        <div class="adset">
          <div class="adset-name">${adset.adset_name ?? ''}</div>
          <div class="field"><span class="label">Audience:</span> ${audience.description ?? ''}</div>
          <div class="field"><span class="label">Placements:</span> ${(adset.placements as string[] ?? []).join(', ')}</div>
          ${adset.retargeting_window ? `<div class="field"><span class="label">Retargeting Window:</span> ${adset.retargeting_window}</div>` : ''}
          ${adsHtml}
        </div>`;
    }).join('');
    return `
      <div class="campaign">
        <div class="campaign-name">${campaign.campaign_name ?? ''}</div>
        <div class="meta-row">
          <span class="badge">${campaign.objective ?? ''}</span>
          <span class="badge">${campaign.strategy_type ?? ''}</span>
          <span class="badge">${Math.round(((campaign.budget_allocation as number) ?? 0) * 100)}% budget</span>
        </div>
        ${adsetsHtml}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title} — AdVize</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; padding: 40px; font-size: 13px; }
  h1 { font-size: 22px; color: #0f0f23; margin-bottom: 4px; }
  .subtitle { color: #555; margin-bottom: 24px; font-size: 13px; }
  .summary { background: #f0fdf4; border-left: 3px solid #10b981; padding: 12px 16px; margin-bottom: 28px; border-radius: 4px; line-height: 1.6; }
  .campaign { margin-bottom: 32px; page-break-inside: avoid; }
  .campaign-name { font-size: 15px; font-weight: 700; color: #0f0f23; margin-bottom: 6px; }
  .meta-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
  .badge { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
  .adset { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px 14px; margin-bottom: 10px; }
  .adset-name { font-weight: 600; font-size: 13px; margin-bottom: 8px; color: #333; }
  .ad { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 10px 12px; margin-top: 8px; }
  .ad-name { font-weight: 600; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .field { margin-bottom: 4px; line-height: 1.5; }
  .label { font-weight: 600; color: #555; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px; }
  @media print { body { padding: 20px; } .campaign { page-break-inside: avoid; } }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="subtitle">Generated by AdVize · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
${summary ? `<div class="summary">${summary}</div>` : ''}
${campaignsHtml}
<div class="footer">AdVize — AI-Powered Meta Ads Strategist · Internal Use Only</div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
