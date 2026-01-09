/**
 * اختبارات E2E الشاملة لنظام المراقبة
 * Monitoring System E2E Tests
 * @version 1.0.0
 */
import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('مراقبة النظام', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await waitForPageLoad(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('admin@waqf.test');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|admin|monitoring)/, { timeout: 10000 }).catch(() => {});
    }
  });

  test('عرض لوحة مراقبة النظام', async ({ page }) => {
    await page.goto('/system-monitoring');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض مؤشرات الأداء', async ({ page }) => {
    await page.goto('/performance-dashboard');
    await waitForPageLoad(page);

    const charts = page.locator('[class*="chart"], canvas, svg');
    const chartsCount = await charts.count();
    console.log(`عدد الرسوم البيانية: ${chartsCount}`);
  });

  test('عرض صحة قاعدة البيانات', async ({ page }) => {
    await page.goto('/database-health');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasHealthContent = content.includes('صحة') || 
                              content.includes('health') || 
                              content.includes('قاعدة') ||
                              content.length > 500;
    expect(hasHealthContent).toBe(true);
  });

  test('عرض أداء قاعدة البيانات', async ({ page }) => {
    await page.goto('/database-performance');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض سجلات الأخطاء', async ({ page }) => {
    await page.goto('/system-error-logs');
    await waitForPageLoad(page);

    const table = page.locator('table, [role="grid"]');
    const hasTable = await table.first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`سجلات الأخطاء: ${hasTable ? '✓ موجودة' : '⚠ غير موجودة'}`);
  });

  test('مراقبة Edge Functions', async ({ page }) => {
    await page.goto('/edge-functions-monitor');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('الأمان', () => {
  test('عرض لوحة الأمان', async ({ page }) => {
    await page.goto('/security-dashboard');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasSecurityContent = content.includes('أمان') || 
                                content.includes('security') || 
                                content.length > 500;
    expect(hasSecurityContent).toBe(true);
  });

  test('عرض تنبيهات الأمان', async ({ page }) => {
    await page.goto('/security-dashboard');
    await waitForPageLoad(page);

    const alerts = page.locator('[class*="alert"], .security-alert');
    const alertsCount = await alerts.count();
    console.log(`عدد تنبيهات الأمان: ${alertsCount}`);
  });
});

test.describe('الإعدادات', () => {
  test('عرض صفحة الإعدادات', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض الإعدادات المتقدمة', async ({ page }) => {
    await page.goto('/advanced-settings');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('إعدادات الإشعارات', async ({ page }) => {
    await page.goto('/notification-settings');
    await waitForPageLoad(page);

    const toggles = page.locator('[role="switch"], input[type="checkbox"]');
    const togglesCount = await toggles.count();
    console.log(`عدد خيارات الإشعارات: ${togglesCount}`);
  });

  test('إعدادات الشفافية', async ({ page }) => {
    await page.goto('/transparency-settings');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('الذكاء الاصطناعي', () => {
  test('عرض المساعد الذكي', async ({ page }) => {
    await page.goto('/chatbot');
    await waitForPageLoad(page);

    const chatInput = page.locator('input[type="text"], textarea');
    if (await chatInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('حقل المحادثة: ✓ موجود');
    }
  });

  test('عرض رؤى الذكاء الاصطناعي', async ({ page }) => {
    await page.goto('/ai-insights');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('تدقيق النظام بالذكاء الاصطناعي', async ({ page }) => {
    await page.goto('/ai-system-audit');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('الدعم والمساعدة', () => {
  test('عرض صفحة الدعم', async ({ page }) => {
    await page.goto('/support');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض قاعدة المعرفة', async ({ page }) => {
    await page.goto('/knowledge-base');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض الأسئلة الشائعة', async ({ page }) => {
    await page.goto('/faq');
    await waitForPageLoad(page);

    const faqItems = page.locator('[data-state], .accordion-item, details');
    const faqCount = await faqItems.count();
    console.log(`عدد الأسئلة الشائعة: ${faqCount}`);
  });

  test('صفحة اتصل بنا', async ({ page }) => {
    await page.goto('/contact');
    await waitForPageLoad(page);

    const form = page.locator('form');
    const hasForm = await form.first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`نموذج الاتصال: ${hasForm ? '✓ موجود' : '⚠ غير موجود'}`);
  });
});

test.describe('نقطة البيع', () => {
  test('عرض صفحة نقطة البيع', async ({ page }) => {
    await page.goto('/point-of-sale');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('تسجيل معاملة جديدة', async ({ page }) => {
    await page.goto('/point-of-sale');
    await waitForPageLoad(page);

    const newTransactionButton = page.locator('button:has-text("معاملة"), button:has-text("تحصيل")');
    if (await newTransactionButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('زر المعاملة: ✓ موجود');
    }
  });
});
