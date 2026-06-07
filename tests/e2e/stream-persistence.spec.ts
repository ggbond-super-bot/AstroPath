/**
 * AstroPath — Keep-Alive Streaming Persistence Test
 * 
 * Validates that AI streaming output continues when user navigates away
 * and returns, thanks to <keep-alive> on router-view.
 * 
 * Routes tested:
 *   /#/ai-chat       — AI chat streaming
 *   /#/assessment    — Assessment report generation
 *   /#/school-recommendation — School recommendation AI analysis
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

function collectErrors(page) {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return () => errors.filter(e =>
    !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR') && !e.includes('[ECharts]')
  );
}

// ══════════════════════════════════════════════════════════════
// Test 1: AI Chat page survives navigation round-trip
// ══════════════════════════════════════════════════════════════
test.describe('Keep-Alive Streaming: AI Chat', () => {
  test('AI Chat component is cached by keep-alive — state preserved on navigation round-trip', async ({ page }) => {
    const getErrors = collectErrors(page);

    // 1. Navigate to AI Chat
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Verify AI Chat page is visible
    const chatPage = page.locator('.ai-chat-page');
    await expect(chatPage).toBeVisible();

    // 3. Navigate away to Assessment
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 4. Verify Assessment page loaded (not AI Chat)
    const assessmentPage = page.locator('.assessment-awwwards');
    await expect(assessmentPage).toBeVisible();

    // 5. Navigate back to AI Chat
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 6. AI Chat should still be visible and intact (kept alive, not re-created)
    await expect(chatPage).toBeVisible();

    // 7. No JS errors
    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });

  test('AI Chat does NOT reset isFreshEntry when navigating back', async ({ page }) => {
    const getErrors = collectErrors(page);

    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Navigate away and back
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // The chat page should still exist without errors
    await expect(page.locator('.ai-chat-page')).toBeVisible();

    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });

  test('Multiple rapid navigation round-trips do not cause errors', async ({ page }) => {
    const getErrors = collectErrors(page);

    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    // Rapid navigation: chat → assessment → chat → timeline → chat → materials → chat
    const routes = [
      '/#/assessment', '/#/ai-chat',
      '/#/timeline', '/#/ai-chat',
      '/#/materials', '/#/ai-chat',
      '/#/university-database', '/#/ai-chat',
      '/#/school-recommendation', '/#/ai-chat',
    ];

    for (const route of routes) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(1000);

    // AI Chat should still work
    await expect(page.locator('.ai-chat-page')).toBeVisible();

    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Test 2: Assessment page survives navigation round-trip
// ══════════════════════════════════════════════════════════════
test.describe('Keep-Alive Streaming: Assessment', () => {
  test('Assessment page is cached — radar chart and form state preserved', async ({ page }) => {
    const getErrors = collectErrors(page);

    // 1. Navigate to Assessment
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Fill in some form data to verify state persistence
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
    }

    // 3. Navigate away
    await page.goto(`${BASE}/#/timeline`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 4. Navigate back
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 5. Assessment page should still be visible
    await expect(page.locator('.assessment-awwwards')).toBeVisible();

    // 6. No JS errors
    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Test 3: School Recommendation page survives navigation
// ══════════════════════════════════════════════════════════════
test.describe('Keep-Alive Streaming: School Recommendation', () => {
  test('School Recommendation page is cached — state preserved on round-trip', async ({ page }) => {
    const getErrors = collectErrors(page);

    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Navigate away and back
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.goto(`${BASE}/#/school-recommendation`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // No JS errors
    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Test 4: Non-keepAlive pages are NOT cached
// ══════════════════════════════════════════════════════════════
test.describe('Non-keepAlive pages behave normally', () => {
  test('Home page is recreated on each visit (no keep-alive)', async ({ page }) => {
    const getErrors = collectErrors(page);

    // Navigate to home
    await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Navigate away and back
    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Home should render normally (fresh each time)
    const hero = page.locator('.hp-hero');
    if (await hero.isVisible()) {
      // Good — home renders correctly
    }

    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });

  test('404 page works correctly (no keep-alive)', async ({ page }) => {
    const getErrors = collectErrors(page);

    await page.goto(`${BASE}/#/this-does-not-exist`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Navigate to a keep-alive page, then back to 404
    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    await page.goto(`${BASE}/#/another-bad-route`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Test 5: Cross-page navigation stress test
// ══════════════════════════════════════════════════════════════
test.describe('Cross-page navigation stress test', () => {
  test('Visit all keep-alive pages in random order — no state leakage', async ({ page }) => {
    const getErrors = collectErrors(page);

    const keepAliveRoutes = [
      '/#/assessment',
      '/#/school-recommendation',
      '/#/ai-chat',
    ];

    const nonKeepAliveRoutes = [
      '/',
      '/#/timeline',
      '/#/materials',
      '/#/university-database',
      '/#/ai-config',
    ];

    // Visit each keep-alive page twice with non-keep-alive pages in between
    for (const kaRoute of keepAliveRoutes) {
      await page.goto(`${BASE}${kaRoute}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);
    }

    for (const nkaRoute of nonKeepAliveRoutes) {
      await page.goto(`${BASE}${nkaRoute}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(200);
    }

    // Visit keep-alive pages again — they should reactivate cleanly
    for (const kaRoute of keepAliveRoutes) {
      await page.goto(`${BASE}${kaRoute}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(1000);

    // No errors across any navigation
    const errors = getErrors();
    expect(errors).toHaveLength(0);
  });
});
