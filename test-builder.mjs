/**
 * End-to-end test for the Campaign Builder flow.
 * Run with: node test-builder.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@advize.local';
const TEST_PASSWORD = 'TestPass123!';

const BRIEF = {
  product: `We offer luxurious, personalized bathrobes, towels, and slippers, custom-embroidered with your name, initials, or special message.
Each piece is crafted from premium fabrics and designed to be the perfect gift or self-care treat.`,
  audience: `Our ideal customer is an adult(Male or Female) aged 25-44, living in urban or suburban areas, who values quality, comfort, and unique personalized products.
They are interested in self-care, gifting, home decor, and luxury lifestyle.
They often shop online for special occasions such as birthdays, weddings, anniversaries, or holidays, and appreciate thoughtful, custom-made gifts for themselves or loved ones.
They prefer convenient, secure payment options like cash on delivery.`,
  budget: '12',
};

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  try {
    // ── Step 1: Login ───────────────────────────────────────────────
    console.log('Step 1: Logging in...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#login-email', TEST_EMAIL);
    await page.fill('#login-password', TEST_PASSWORD);
    await page.click('#login-submit-btn');

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    console.log('✓ Logged in and on dashboard');

    // ── Step 2: Navigate to builder ─────────────────────────────────
    console.log('\nStep 2: Navigating to Campaign Builder...');
    await page.goto(`${BASE_URL}/builder`);
    await page.waitForLoadState('networkidle');
    console.log('✓ On builder page');

    // ── Step 3: Fill the brief form ─────────────────────────────────
    console.log('\nStep 3: Filling brief form...');

    await page.fill('#brief-product', BRIEF.product);
    console.log('  ✓ Product description filled');

    await page.click('#brief-objective-leads', { force: true });
    console.log('  ✓ Objective: Leads selected');

    await page.fill('#brief-audience', BRIEF.audience);
    console.log('  ✓ Target audience filled');

    await page.fill('#brief-budget', '');
    await page.fill('#brief-budget', BRIEF.budget);
    console.log('  ✓ Daily budget: $12');

    // Leave special requirements empty (optional)
    console.log('  ✓ Special requirements: empty (optional)');

    // ── Step 4: Submit and wait for AI generation ───────────────────
    console.log('\nStep 4: Submitting — waiting for AI to generate campaign plan...');
    console.log('  (This may take 30–120 seconds)');
    await page.click('#brief-submit');

    // Wait for the generating skeleton to appear
    await page.waitForSelector('.ai-status', { timeout: 10000 });
    console.log('  ✓ AI generation started');

    // Wait until redirected to /builder/{id} (generation + save complete)
    // Timeout: 3 minutes for AI + DB save
    await page.waitForURL(/\/builder\/[0-9a-f-]{36}$/, { timeout: 200000 });
    const finalUrl = page.url();
    const planId = finalUrl.split('/builder/')[1];

    console.log(`\n✅ SUCCESS! Redirected to plan: ${finalUrl}`);
    console.log(`   Plan ID: ${planId}`);

    // ── Step 5: Verify plan page loaded ────────────────────────────
    console.log('\nStep 5: Verifying plan detail page loads...');
    
    // .builder-sidebar only exists inside PlanView (success state), not in loading/error states
    try {
      await page.waitForSelector('.builder-sidebar', { timeout: 20000 });
      const heading = await page.locator('h1.page-title').first().innerText();
      console.log(`  ✓ Plan loaded with title: "${heading}"`);
    } catch {
      // Check if there's an actual error message on the page
      const errorEl = page.locator('p.auth-error[role="alert"]');
      const errorCount = await errorEl.count();
      if (errorCount > 0) {
        const errorText = await errorEl.first().innerText();
        throw new Error(`Plan detail page error: "${errorText || 'Plan not found.'}"`);
      }
      throw new Error('Plan content (.builder-sidebar) never appeared on detail page');
    }

    console.log('\n✅ All tests passed! Campaign Builder is working end-to-end.');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    // Take screenshot on failure
    await page.screenshot({ path: 'test-failure.png', fullPage: true });
    console.log('Screenshot saved: test-failure.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
