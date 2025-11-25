import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('التحويلات البنكية', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/bank-transfers');
  });

  test('عرض قائمة التحويلات', async ({ page }) => {
    await expectVisible(page, 'text=التحويلات البنكية');
    await expectVisible(page, 'button:has-text("تحويل جديد")');
  });

  test('إنشاء ملف تحويل بنكي', async ({ page }) => {
    await page.click('button:has-text("ملف تحويل جديد")');
    
    await expectVisible(page, 'text=إنشاء ملف تحويل بنكي');
    await expectVisible(page, 'select[name="bank_account_id"]');
    await expectVisible(page, 'select[name="file_format"]');
  });

  test('تصدير ملف ISO20022', async ({ page }) => {
    await page.click('button:has-text("تصدير ISO20022")');
    
    await page.waitForTimeout(1000);
    // التحقق من تحميل الملف
  });

  test('استيراد كشف حساب بنكي', async ({ page }) => {
    await page.click('button:has-text("استيراد كشف")');
    
    await expectVisible(page, 'text=استيراد كشف حساب بنكي');
    await expectVisible(page, 'input[type="file"]');
  });

  test('عرض حالة التحويلات', async ({ page }) => {
    await expectVisible(page, '[data-status="pending"]');
    await expectVisible(page, '[data-status="processed"]');
  });

  test('التسوية البنكية التلقائية', async ({ page }) => {
    await page.click('text=التسوية التلقائية');
    
    await expectVisible(page, 'text=التسوية البنكية التلقائية');
    await expectVisible(page, 'button:has-text("بدء التسوية")');
  });
});
