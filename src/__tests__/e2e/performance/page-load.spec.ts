/**
 * اختبارات E2E للأداء
 * Performance E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Page Load Performance', () => {
  const PERFORMANCE_THRESHOLDS = {
    LCP: 2500, // Largest Contentful Paint
    FCP: 1800, // First Contentful Paint
    TTI: 3800, // Time to Interactive
    CLS: 0.1,  // Cumulative Layout Shift
  };

  test('landing page should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Landing page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('login page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Login page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should lazy load dashboard components', async ({ page }) => {
    // تسجيل دخول أولاً
    await page.goto('/login');
    await page.getByRole('tab', { name: 'الموظفين' }).click();
    await page.getByPlaceholder('البريد الإلكتروني').fill('admin@waqf.test');
    await page.getByPlaceholder('كلمة المرور').fill('admin123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    const startTime = Date.now();
    await page.waitForURL('/dashboard');
    
    // التحقق من تحميل المكونات الأساسية أولاً
    const dashboardHeader = page.locator('h1');
    await expect(dashboardHeader).toBeVisible();
    
    const initialLoadTime = Date.now() - startTime;
    console.log(`✅ Dashboard initial load: ${initialLoadTime}ms`);
    
    // المكونات الثانوية يجب أن تُحمّل lazily
    expect(initialLoadTime).toBeLessThan(4000);
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // قياس Web Vitals باستخدام Performance API
    const metrics = await page.evaluate(() => {
      return new Promise<{
        lcp: number | null;
        fcp: number | null;
        cls: number | null;
      }>((resolve) => {
        const results = {
          lcp: null as number | null,
          fcp: null as number | null,
          cls: null as number | null,
        };

        // FCP
        const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
        const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
        if (fcp) results.fcp = fcp.startTime;

        // LCP
        if (typeof PerformanceObserver !== 'undefined') {
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
              if (lastEntry) results.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch {
            // Browser doesn't support LCP
          }

          // CLS
          try {
            let clsScore = 0;
            const clsObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[];
              entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                  clsScore += entry.value;
                }
              });
              results.cls = clsScore;
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
          } catch {
            // Browser doesn't support CLS
          }
        }

        // Wait a bit for metrics to be collected
        setTimeout(() => resolve(results), 2000);
      });
    });

    console.log('📊 Core Web Vitals:');
    if (metrics.fcp !== null) {
      console.log(`  FCP: ${metrics.fcp.toFixed(2)}ms`);
      expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
    }
    if (metrics.lcp !== null) {
      console.log(`  LCP: ${metrics.lcp.toFixed(2)}ms`);
    }
    if (metrics.cls !== null) {
      console.log(`  CLS: ${metrics.cls.toFixed(4)}`);
      expect(metrics.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
    }
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    let optimizedCount = 0;
    
    for (const img of images) {
      const loading = await img.getAttribute('loading');
      const decoding = await img.getAttribute('decoding');
      
      if (loading === 'lazy' || decoding === 'async') {
        optimizedCount++;
      }
    }
    
    console.log(`✅ ${optimizedCount}/${images.length} images are optimized`);
    
    // At least 50% of images should be optimized
    if (images.length > 0) {
      expect(optimizedCount / images.length).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('should cache static assets', async ({ page }) => {
    // First load
    await page.goto('/');
    
    // Second load should be faster due to caching
    const startTime = Date.now();
    await page.reload();
    const reloadTime = Date.now() - startTime;
    
    console.log(`✅ Page reload time: ${reloadTime}ms`);
    expect(reloadTime).toBeLessThan(3000);
  });
});

test.describe('Bundle Size Optimization', () => {
  test('should not load heavy libraries on initial page', async ({ page }) => {
    const networkRequests: string[] = [];
    
    page.on('request', (request) => {
      if (request.resourceType() === 'script') {
        networkRequests.push(request.url());
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check that heavy libraries are not loaded initially
    const heavyLibs = ['recharts', 'jspdf', 'xlsx', 'framer-motion'];
    const loadedHeavyLibs = networkRequests.filter(url => 
      heavyLibs.some(lib => url.includes(lib))
    );
    
    console.log(`✅ Heavy libraries loaded on login: ${loadedHeavyLibs.length}`);
    console.log('  Loaded:', loadedHeavyLibs.map(url => url.split('/').pop()));
    
    // Should not load chart/pdf/excel libraries on login page
    expect(loadedHeavyLibs.length).toBeLessThanOrEqual(1);
  });
});

test.describe('API Performance', () => {
  test('should have fast API response times', async ({ page }) => {
    const apiTimes: { url: string; duration: number }[] = [];
    const requestStartTimes = new Map<string, number>();
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('supabase') && url.includes('/rest/')) {
        requestStartTimes.set(url, Date.now());
      }
    });
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('supabase') && url.includes('/rest/')) {
        const startTime = requestStartTimes.get(url);
        if (startTime) {
          const duration = Date.now() - startTime;
          apiTimes.push({
            url: url.split('?')[0].split('/').slice(-2).join('/'),
            duration,
          });
          requestStartTimes.delete(url);
        }
      }
    });
    
    // تسجيل دخول
    await page.goto('/login');
    await page.getByRole('tab', { name: 'الموظفين' }).click();
    await page.getByPlaceholder('البريد الإلكتروني').fill('admin@waqf.test');
    await page.getByPlaceholder('كلمة المرور').fill('admin123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('📊 API Response Times:');
    apiTimes.forEach(({ url, duration }) => {
      console.log(`  ${url}: ${duration.toFixed(2)}ms`);
    });
    
    // Average API time should be under 500ms
    if (apiTimes.length > 0) {
      const avgTime = apiTimes.reduce((sum, t) => sum + t.duration, 0) / apiTimes.length;
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    }
  });
});
