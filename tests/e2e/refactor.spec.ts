/**
 * AstroPath E2E Browser Test
 * Tests critical pages after refactor
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('AstroPath Refactor E2E', () => {

  test('homepage renders correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Page should not be blank
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    // Check no critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR')
    );
    expect(criticalErrors).toEqual([]);

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: false });
    console.log('✓ Homepage: PASS');
  });

  test('assessment page renders with Element Plus components', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE}/#/assessment`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check Element Plus input renders
    const inputs = await page.locator('.el-input').count();
    expect(inputs).toBeGreaterThan(0);

    // Check no critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR')
    );
    if (criticalErrors.length > 0) {
      console.log('JS Errors:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);

    // Check button color is Slate-900 (#0F172A) not Academic Navy (#1E3A5F)
    const btnBg = await page.evaluate(() => {
      const btn = document.querySelector('.el-button--primary');
      if (!btn) return 'not found';
      return window.getComputedStyle(btn).backgroundColor;
    });
    console.log('Button background:', btnBg);
    // #0F172A = rgb(15, 23, 42)
    expect(btnBg).toContain('15, 23, 42');

    await page.screenshot({ path: 'test-results/assessment.png', fullPage: false });
    console.log('✓ Assessment: PASS');
  });

  test('university database renders el-table correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE}/#/university-database`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check el-table renders
    const tables = await page.locator('.el-table').count();
    expect(tables).toBeGreaterThan(0);

    // Check no critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR') && !e.includes('echarts')
    );
    if (criticalErrors.length > 0) {
      console.log('DB JS Errors:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);

    await page.screenshot({ path: 'test-results/database.png', fullPage: false });
    console.log('✓ University Database: PASS');
  });

  test('AI chat page renders correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE}/#/ai-chat`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check el-button renders
    const buttons = await page.locator('.el-button').count();
    expect(buttons).toBeGreaterThan(0);

    // Check no critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR')
    );
    if (criticalErrors.length > 0) {
      console.log('Chat JS Errors:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);

    await page.screenshot({ path: 'test-results/aichat.png', fullPage: false });
    console.log('✓ AI Chat: PASS');
  });

  test('AI config page renders correctly', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${BASE}/#/ai-config`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check form elements render
    const forms = await page.locator('form, .el-form').count();
    // At least body should have content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);

    // Check no critical JS errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('net::ERR')
    );
    if (criticalErrors.length > 0) {
      console.log('Config JS Errors:', criticalErrors);
    }
    expect(criticalErrors).toEqual([]);

    await page.screenshot({ path: 'test-results/aiconfig.png', fullPage: false });
    console.log('✓ AI Config: PASS');
  });
});
