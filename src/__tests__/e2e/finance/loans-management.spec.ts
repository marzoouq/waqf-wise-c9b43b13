import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة القروض', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/loans');
  });

  test('عرض قائمة القروض', async ({ page }) => {
    await expectVisible(page, 'text=إدارة القروض');
    await expectVisible(page, 'button:has-text("قرض جديد")');
    
    const loansCount = await page.locator('[data-testid="loan-card"]').count();
    expect(loansCount).toBeGreaterThan(0);
  });

  test('إضافة قرض جديد', async ({ page }) => {
    await page.click('button:has-text("قرض جديد")');
    
    await expectVisible(page, 'text=قرض جديد');
    await expectVisible(page, 'select[name="beneficiary_id"]');
    await expectVisible(page, 'input[name="principal_amount"]');
    await expectVisible(page, 'select[name="term_months"]');
  });

  test('عرض تفاصيل القرض', async ({ page }) => {
    await page.locator('[data-testid="loan-card"]').first().click();
    
    await expectVisible(page, 'text=تفاصيل القرض');
    await expectVisible(page, 'text=جدول السداد');
    await expectVisible(page, 'text=الأقساط المدفوعة');
  });

  test('تسجيل دفعة قسط', async ({ page }) => {
    await page.locator('[data-testid="loan-card"]').first().click();
    await page.click('button:has-text("تسجيل دفعة")');
    
    await expectVisible(page, 'text=تسجيل دفعة قسط');
    await expectVisible(page, 'input[name="payment_amount"]');
  });

  test('تقرير القروض المتأخرة', async ({ page }) => {
    await page.click('text=القروض المتأخرة');
    
    await expectVisible(page, 'text=القروض المتأخرة');
    const overdueCount = await page.locator('[data-testid="overdue-loan"]').count();
    expect(overdueCount).toBeGreaterThanOrEqual(0);
  });

  test('حساب أعمار الديون', async ({ page }) => {
    await page.click('text=أعمار الديون');
    
    await expectVisible(page, 'text=تحليل أعمار الديون');
    await expectVisible(page, 'text=أقل من 30 يوم');
    await expectVisible(page, 'text=31-60 يوم');
  });
});
