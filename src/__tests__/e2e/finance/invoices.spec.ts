import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة الفواتير', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/invoices');
  });

  test('عرض قائمة الفواتير', async ({ page }) => {
    await expectVisible(page, 'text=إدارة الفواتير');
    await expectVisible(page, 'button:has-text("فاتورة جديدة")');
  });

  test('إنشاء فاتورة جديدة', async ({ page }) => {
    await page.click('button:has-text("فاتورة جديدة")');
    
    await expectVisible(page, 'text=فاتورة جديدة');
    await expectVisible(page, 'select[name="customer"]');
    await expectVisible(page, 'button:has-text("إضافة بند")');
  });

  test('طباعة فاتورة', async ({ page }) => {
    const firstInvoice = page.locator('[data-testid="invoice-card"]').first();
    if (await firstInvoice.count() > 0) {
      await firstInvoice.click();
      await page.click('button:has-text("طباعة")');
      
      await page.waitForTimeout(1000);
    }
  });

  test('إرسال فاتورة بالبريد', async ({ page }) => {
    const firstInvoice = page.locator('[data-testid="invoice-card"]').first();
    if (await firstInvoice.count() > 0) {
      await firstInvoice.click();
      await page.click('button:has-text("إرسال")');
      
      await expectVisible(page, 'text=إرسال الفاتورة');
    }
  });

  test('تسجيل دفعة فاتورة', async ({ page }) => {
    const unpaidInvoice = page.locator('[data-status="unpaid"]').first();
    if (await unpaidInvoice.count() > 0) {
      await unpaidInvoice.click();
      await page.click('button:has-text("تسجيل دفعة")');
      
      await expectVisible(page, 'text=تسجيل دفعة');
      await expectVisible(page, 'input[name="payment_amount"]');
    }
  });

  test('تقرير الفواتير المتأخرة', async ({ page }) => {
    await page.click('text=الفواتير المتأخرة');
    
    await expectVisible(page, 'text=الفواتير المتأخرة');
  });
});
