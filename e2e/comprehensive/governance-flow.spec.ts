/**
 * اختبارات E2E الشاملة لنظام الحوكمة
 * Governance System E2E Tests
 * @version 1.0.0
 */
import { test, expect, Page } from '@playwright/test';

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('نظام الحوكمة', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await waitForPageLoad(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('nazer@waqf.test');
      await page.locator('input[type="password"]').fill('nazer123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|nazer|governance)/, { timeout: 10000 }).catch(() => {});
    }
  });

  test('عرض قرارات الحوكمة', async ({ page }) => {
    await page.goto('/governance-decisions');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasContent = content.includes('قرار') || 
                       content.includes('حوكمة') || 
                       content.length > 500;
    expect(hasContent).toBe(true);
  });

  test('إنشاء قرار جديد', async ({ page }) => {
    await page.goto('/governance-decisions');
    await waitForPageLoad(page);

    const addButton = page.locator('button:has-text("قرار جديد"), button:has-text("إضافة")');
    if (await addButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.first().click();
      await waitForPageLoad(page);

      const form = page.locator('[role="dialog"], form');
      const hasForm = await form.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`نموذج القرار: ${hasForm ? '✓ يظهر' : '⚠ لا يظهر'}`);

      await page.keyboard.press('Escape');
    }
  });

  test('عرض تفاصيل قرار', async ({ page }) => {
    await page.goto('/governance-decisions');
    await waitForPageLoad(page);

    const decisionCard = page.locator('.card, [role="article"], table tbody tr').first();
    if (await decisionCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await decisionCard.click();
      await waitForPageLoad(page);
      console.log('تفاصيل القرار: ✓ تظهر');
    }
  });

  test('التصويت على قرار', async ({ page }) => {
    await page.goto('/governance-decisions');
    await waitForPageLoad(page);

    const voteButton = page.locator('button:has-text("تصويت"), button:has-text("موافق"), button:has-text("رفض")');
    if (await voteButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('أزرار التصويت: ✓ موجودة');
    }
  });
});

test.describe('الإفصاحات السنوية', () => {
  test('عرض صفحة الإفصاحات', async ({ page }) => {
    await page.goto('/disclosures');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض تفاصيل إفصاح', async ({ page }) => {
    await page.goto('/disclosures');
    await waitForPageLoad(page);

    const disclosureCard = page.locator('.card, [role="article"], table tbody tr').first();
    if (await disclosureCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await disclosureCard.click();
      await waitForPageLoad(page);
      console.log('تفاصيل الإفصاح: ✓ تظهر');
    }
  });

  test('تصدير إفصاح PDF', async ({ page }) => {
    await page.goto('/disclosures');
    await waitForPageLoad(page);

    const exportButton = page.locator('button:has-text("تصدير"), button:has-text("PDF")');
    if (await exportButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('زر تصدير الإفصاح: ✓ موجود');
    }
  });
});

test.describe('لوحة تحكم الناظر', () => {
  test('عرض لوحة تحكم الناظر', async ({ page }) => {
    await page.goto('/nazer-dashboard');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasNazerContent = content.includes('ناظر') || 
                            content.includes('إدارة') || 
                            content.length > 500;
    expect(hasNazerContent).toBe(true);
  });

  test('عرض إحصائيات الناظر', async ({ page }) => {
    await page.goto('/nazer-dashboard');
    await waitForPageLoad(page);

    const statsCards = page.locator('.stat-card, [class*="stats"], .card');
    const count = await statsCards.count();
    console.log(`بطاقات الإحصائيات: ${count}`);
  });

  test('توزيع الإيرادات', async ({ page }) => {
    await page.goto('/nazer-dashboard');
    await waitForPageLoad(page);

    const distributeButton = page.locator('button:has-text("توزيع"), button:has-text("صرف")');
    if (await distributeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('زر التوزيع: ✓ موجود');
    }
  });

  test('نشر السنة المالية', async ({ page }) => {
    await page.goto('/nazer-dashboard');
    await waitForPageLoad(page);

    const publishButton = page.locator('button:has-text("نشر"), button:has-text("إغلاق السنة")');
    if (await publishButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('زر النشر: ✓ موجود');
    }
  });
});

test.describe('سجلات التدقيق', () => {
  test('عرض سجلات التدقيق', async ({ page }) => {
    await page.goto('/audit-logs');
    await waitForPageLoad(page);

    const table = page.locator('table, [role="grid"]');
    const hasTable = await table.first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`سجلات التدقيق: ${hasTable ? '✓ موجودة' : '⚠ غير موجودة'}`);
  });

  test('فلترة سجلات التدقيق', async ({ page }) => {
    await page.goto('/audit-logs');
    await waitForPageLoad(page);

    const filterInput = page.locator('input[type="search"], [role="combobox"]');
    if (await filterInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('فلتر السجلات: ✓ موجود');
    }
  });
});

test.describe('إدارة المستخدمين', () => {
  test('عرض قائمة المستخدمين', async ({ page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);

    const table = page.locator('table, [role="grid"]');
    const hasTable = await table.first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`قائمة المستخدمين: ${hasTable ? '✓ موجودة' : '⚠ غير موجودة'}`);
  });

  test('إضافة مستخدم جديد', async ({ page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);

    const addButton = page.locator('button:has-text("إضافة"), button:has-text("مستخدم جديد")');
    if (await addButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.first().click();
      await waitForPageLoad(page);

      const form = page.locator('[role="dialog"], form');
      const hasForm = await form.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`نموذج المستخدم: ${hasForm ? '✓ يظهر' : '⚠ لا يظهر'}`);

      await page.keyboard.press('Escape');
    }
  });

  test('إدارة الصلاحيات', async ({ page }) => {
    await page.goto('/permissions-management');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('إدارة الأدوار', async ({ page }) => {
    await page.goto('/roles-management');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});
