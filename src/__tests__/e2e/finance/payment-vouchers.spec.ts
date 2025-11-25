import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('سندات الدفع', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/payment-vouchers');
  });

  test('عرض قائمة سندات الدفع', async ({ page }) => {
    await expectVisible(page, 'text=سندات الدفع');
    await expectVisible(page, 'button:has-text("سند جديد")');
    
    const vouchersCount = await page.locator('[data-testid="voucher-card"]').count();
    expect(vouchersCount).toBeGreaterThan(0);
  });

  test('إنشاء سند دفع جديد', async ({ page }) => {
    await page.click('button:has-text("سند جديد")');
    
    await expectVisible(page, 'text=سند دفع جديد');
    await expectVisible(page, 'select[name="beneficiary_id"]');
    await expectVisible(page, 'input[name="amount"]');
  });

  test('عرض تفاصيل سند الدفع', async ({ page }) => {
    await page.locator('[data-testid="voucher-card"]').first().click();
    
    await expectVisible(page, 'text=تفاصيل سند الدفع');
    await expectVisible(page, 'text=رقم السند');
    await expectVisible(page, 'text=المبلغ');
    await expectVisible(page, 'text=المستفيد');
  });

  test('طباعة سند الدفع', async ({ page }) => {
    await page.locator('[data-testid="voucher-card"]').first().click();
    await page.click('button:has-text("طباعة")');
    
    // التحقق من فتح نافذة الطباعة أو تحميل PDF
    await page.waitForTimeout(1000);
  });

  test('اعتماد سند الدفع', async ({ page }) => {
    const pendingVoucher = page.locator('[data-status="pending"]').first();
    if (await pendingVoucher.count() > 0) {
      await pendingVoucher.click();
      await page.click('button:has-text("اعتماد")');
      
      await expectToast(page, 'تم اعتماد سند الدفع');
    }
  });
});
