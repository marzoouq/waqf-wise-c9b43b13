import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E & Visual Regression Testing Configuration
 * للاختبارات الشاملة E2E واختبارات Visual Regression للمنصة
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: !process.env.CI, // ✅ تعطيل التوازي في CI لتجنب race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // ✅ زيادة timeout للاختبارات في CI
  timeout: process.env.CI ? 60000 : 30000,
  
  // Visual Regression Settings
  expect: {
    timeout: process.env.CI ? 10000 : 5000, // ✅ مزيد من الوقت للـ assertions في CI
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  
  // Snapshot directory
  snapshotDir: './e2e/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.CI ? [['github'] as const] : []), // ✅ GitHub Actions reporter في CI
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    // ✅ إضافة actionTimeout لتجنب توقف الاختبارات
    actionTimeout: process.env.CI ? 15000 : 10000,
    navigationTimeout: process.env.CI ? 30000 : 15000,
  },

  projects: [
    // ✅ في CI نختبر فقط chromium لتوفير الوقت
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // ✅ الباقي فقط محلياً أو عند الحاجة
    ...(!process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    ] : []),
  ],

  webServer: {
    // استخدم build + preview في CI لثبات أعلى، وdev محلياً
    command: process.env.CI ? 'npm run build && npm run preview -- --port 5173' : 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    // ✅ إضافة stdout/stderr logging في CI للتشخيص
    stdout: process.env.CI ? 'pipe' : 'ignore',
    stderr: process.env.CI ? 'pipe' : 'ignore',
  },
});
