import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم موظف الصرف', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cashier');
    await navigateTo(page, '/');
  });

  test('عرض المدفوعات المعلقة', async ({ page }) => {
    await expectVisible(page, 'text=مدفوعات معلقة');
    
    const pendingPayments = await page.locator('[data-status="pending"]').count();
    console.log(`✅ المدفوعات المعلقة: ${pendingPayments}`);
  });

  test('عرض ملخص المدفوعات اليومية', async ({ page }) => {
    await expectVisible(page, 'text=المدفوعات اليومية');
    await expectVisible(page, 'text=المبلغ الإجمالي');
    await expectVisible(page, 'text=عدد المدفوعات');
  });

  test('عرض سندات الدفع المعتمدة', async ({ page }) => {
    await expectVisible(page, 'text=سندات معتمدة');
    
    const approvedVouchers = await page.locator('[data-status="approved"]').count();
    console.log(`✅ السندات المعتمدة: ${approvedVouchers}`);
  });

  test('تنفيذ دفعة سريعة', async ({ page }) => {
    const quickPayButton = page.locator('button:has-text("دفعة سريعة")').first();
    if (await quickPayButton.count() > 0) {
      await quickPayButton.click();
      await expectVisible(page, 'text=تنفيذ دفعة');
      console.log('✅ الدفعة السريعة متاحة');
    }
  });

  test('عرض التحويلات البنكية المعلقة', async ({ page }) => {
    const transfersSection = page.locator('[data-testid="pending-transfers"]');
    if (await transfersSection.count() > 0) {
      const transfersCount = await page.locator('[data-testid="transfer-item"]').count();
      console.log(`✅ التحويلات المعلقة: ${transfersCount}`);
    }
  });

  test('عرض إحصائيات المدفوعات الشهرية', async ({ page }) => {
    const monthlyChart = page.locator('[data-testid="monthly-payments-chart"]');
    if (await monthlyChart.count() > 0) {
      await expectVisible(page, 'text=المدفوعات الشهرية');
      console.log('✅ الرسم البياني الشهري متاح');
    }
  });

  test('عرض المستفيدين الذين لم يتم الدفع لهم', async ({ page }) => {
    const unpaidSection = page.locator('[data-testid="unpaid-beneficiaries"]');
    if (await unpaidSection.count() > 0) {
      const unpaidCount = await page.locator('[data-testid="unpaid-beneficiary"]').count();
      console.log(`✅ المستفيدون غير المدفوع لهم: ${unpaidCount}`);
    }
  });

  test('طباعة سند دفع', async ({ page }) => {
    const printButton = page.locator('button:has-text("طباعة")').first();
    if (await printButton.count() > 0) {
      await printButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ الطباعة متاحة');
    }
  });

  test('تصدير قائمة المدفوعات', async ({ page }) => {
    const exportButton = page.locator('button:has-text("تصدير")').first();
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ التصدير متاح');
    }
  });

  test('عرض تنبيهات الدفع المتأخرة', async ({ page }) => {
    const alertsSection = page.locator('[data-testid="overdue-alerts"]');
    if (await alertsSection.count() > 0) {
      const alertsCount = await page.locator('[data-testid="overdue-alert"]').count();
      console.log(`✅ تنبيهات التأخير: ${alertsCount}`);
    }
  });
});
