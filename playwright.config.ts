import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  expect: {
    timeout: 15000
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    actionTimeout: 10000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
  },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html-report' }],
  ],
  webServer: {
    command: 'npx vite --port 3000 --host',
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
  },
  outputDir: 'test-results',
  globalTeardown: undefined,
});
