import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Cashier Payment Processing', () => {
  test('Complete cashier daily operations', async ({ page }) => {
    // 1. تسجيل الدخول كأمين صندوق
    await loginAs(page, 'cashier');
    
    // 2. التحقق من الوصول إلى لوحة تحكم أمين الصندوق
    await expect(page).toHaveURL(/\/cashier-dashboard/);
    await expect(page.locator('h1')).toContainText('لوحة تحكم أمين الصندوق');
    
    // 3. عرض إحصائيات الصندوق
    await expect(page.locator('[data-testid="cashier-stats"]')).toBeVisible();
    
    // 4. الانتقال إلى المدفوعات
    await navigateTo(page, '/payments');
    
    // 5. إنشاء سند صرف
    await page.click('button:has-text("سند صرف")');
    await page.fill('[name="amount"]', '20000');
    await page.fill('[name="beneficiary_name"]', 'مستفيد اختبار');
    await page.fill('[name="description"]', 'صرف مستحقات شهرية');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إنشاء سند الصرف')).toBeVisible();
    
    // 6. إنشاء سند قبض
    await page.click('button:has-text("سند قبض")');
    await page.fill('[name="amount"]', '15000');
    await page.fill('[name="payer_name"]', 'دافع اختبار');
    await page.fill('[name="description"]', 'تبرع');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إنشاء سند القبض')).toBeVisible();
    
    // 7. عرض كشف الصندوق اليومي
    await page.click('text=كشف الصندوق');
    await expect(page.locator('[data-testid="cash-statement"]')).toBeVisible();
    
    // 8. طباعة الكشف
    await page.click('button:has-text("طباعة")');
    
    // 9. تسجيل الخروج
    await logout(page);
  });
  
  test('Process multiple beneficiary payments', async ({ page }) => {
    await loginAs(page, 'cashier');
    
    await navigateTo(page, '/payments');
    
    // صرف مستحقات متعددة
    const beneficiaries = ['مستفيد 1', 'مستفيد 2', 'مستفيد 3'];
    
    for (const beneficiary of beneficiaries) {
      await page.click('button:has-text("سند صرف")');
      await page.fill('[name="amount"]', '5000');
      await page.fill('[name="beneficiary_name"]', beneficiary);
      await page.fill('[name="description"]', 'مستحقات شهرية');
      await page.click('button:has-text("حفظ")');
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('text=تم إنشاء سند الصرف')).toHaveCount(3);
    
    await logout(page);
  });
});
