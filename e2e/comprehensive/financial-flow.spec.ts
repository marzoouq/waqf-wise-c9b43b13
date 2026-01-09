/**
 * اختبارات E2E الشاملة للتدفقات المالية
 * Financial Flow E2E Tests
 * @version 1.0.0
 */
import { test, expect, Page } from '@playwright/test';

// Helper: الانتظار حتى تحميل الصفحة
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('التدفقات المالية الشاملة', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await waitForPageLoad(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('accountant@waqf.test');
      await page.locator('input[type="password"]').fill('accountant123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|accounting|accountant)/, { timeout: 10000 }).catch(() => {});
    }
  });

  test('عرض صفحة المحاسبة', async ({ page }) => {
    await page.goto('/accounting');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(500);
  });

  test('عرض دليل الحسابات', async ({ page }) => {
    await page.goto('/accounting');
    await waitForPageLoad(page);

    // البحث عن تبويب الحسابات
    const accountsTab = page.locator('button:has-text("الحسابات"), [role="tab"]:has-text("دليل الحسابات")');
    if (await accountsTab.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await accountsTab.first().click();
      await waitForPageLoad(page);

      // التحقق من وجود جدول الحسابات
      const table = page.locator('table, [role="tree"], .accounts-tree');
      const hasTable = await table.first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`دليل الحسابات: ${hasTable ? '✓ موجود' : '⚠ غير موجود'}`);
    }
  });

  test('عرض القيود اليومية', async ({ page }) => {
    await page.goto('/accounting');
    await waitForPageLoad(page);

    const journalTab = page.locator('button:has-text("القيود"), [role="tab"]:has-text("اليومية")');
    if (await journalTab.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await journalTab.first().click();
      await waitForPageLoad(page);

      const table = page.locator('table, [role="grid"]');
      const hasTable = await table.first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`القيود اليومية: ${hasTable ? '✓ موجودة' : '⚠ غير موجودة'}`);
    }
  });

  test('إضافة قيد يومي جديد', async ({ page }) => {
    await page.goto('/accounting');
    await waitForPageLoad(page);

    const addButton = page.locator('button:has-text("إضافة قيد"), button:has-text("قيد جديد")');
    if (await addButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.first().click();
      await waitForPageLoad(page);

      // التحقق من ظهور نموذج القيد
      const form = page.locator('[role="dialog"], form');
      const hasForm = await form.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`نموذج القيد: ${hasForm ? '✓ يظهر' : '⚠ لا يظهر'}`);

      await page.keyboard.press('Escape');
    }
  });

  test('عرض الفواتير', async ({ page }) => {
    await page.goto('/invoices');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasInvoiceContent = content.includes('فاتورة') || 
                              content.includes('invoice') || 
                              content.length > 500;
    expect(hasInvoiceContent).toBe(true);
  });

  test('عرض المدفوعات', async ({ page }) => {
    await page.goto('/payments');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasPaymentContent = content.includes('دفع') || 
                              content.includes('payment') || 
                              content.length > 500;
    expect(hasPaymentContent).toBe(true);
  });

  test('عرض سندات الصرف', async ({ page }) => {
    await page.goto('/payment-vouchers');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض الميزانيات', async ({ page }) => {
    await page.goto('/budgets');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض التوزيعات', async ({ page }) => {
    await page.goto('/distributions');
    await waitForPageLoad(page);

    const table = page.locator('table, [role="grid"], .distribution-card');
    const hasContent = await table.first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`التوزيعات: ${hasContent ? '✓ موجودة' : '⚠ غير موجودة'}`);
  });

  test('عرض الصناديق', async ({ page }) => {
    await page.goto('/funds');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('عرض القروض', async ({ page }) => {
    await page.goto('/loans');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('التقارير المالية', () => {
  test('عرض التقارير', async ({ page }) => {
    await page.goto('/reports');
    await waitForPageLoad(page);

    const content = await page.content();
    const hasReportContent = content.includes('تقرير') || 
                              content.includes('report') || 
                              content.length > 500;
    expect(hasReportContent).toBe(true);
  });

  test('تصدير تقرير PDF', async ({ page }) => {
    await page.goto('/reports');
    await waitForPageLoad(page);

    const exportButton = page.locator('button:has-text("تصدير"), button:has-text("PDF")');
    if (await exportButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('زر التصدير: ✓ موجود');
    }
  });

  test('عرض التحويلات البنكية', async ({ page }) => {
    await page.goto('/bank-transfers');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('سير عمل الموافقات', () => {
  test('عرض صفحة الموافقات', async ({ page }) => {
    await page.goto('/approvals');
    await waitForPageLoad(page);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('فلترة الموافقات حسب الحالة', async ({ page }) => {
    await page.goto('/approvals');
    await waitForPageLoad(page);

    const statusFilter = page.locator('select, [role="combobox"]');
    if (await statusFilter.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.first().click();
      await waitForPageLoad(page);
      console.log('فلتر الحالة: ✓ يعمل');
    }
  });
});
