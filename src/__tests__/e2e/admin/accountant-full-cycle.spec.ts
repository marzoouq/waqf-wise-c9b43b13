import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Accountant Full Cycle Workflow', () => {
  test('Complete accountant daily operations', async ({ page }) => {
    // 1. تسجيل الدخول كمحاسب
    await loginAs(page, 'accountant');
    
    // 2. التحقق من الوصول إلى لوحة تحكم المحاسب
    await expect(page).toHaveURL(/\/accountant-dashboard/);
    await expect(page.locator('h1')).toContainText('لوحة تحكم المحاسب');
    
    // 3. التحقق من KPIs المحاسبية
    await expect(page.locator('[data-testid="accounting-kpis"]')).toBeVisible();
    
    // 4. الانتقال إلى المحاسبة
    await navigateTo(page, '/accounting');
    await expect(page).toHaveURL('/accounting');
    
    // 5. عرض شجرة الحسابات
    await page.click('text=شجرة الحسابات');
    await expect(page.locator('[data-testid="accounts-tree"]')).toBeVisible();
    
    // 6. إنشاء حساب جديد
    await page.click('button:has-text("إضافة حساب")');
    await page.fill('[name="name_ar"]', 'حساب اختبار');
    await page.fill('[name="code"]', '1001');
    await page.selectOption('[name="account_type"]', 'asset');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إضافة الحساب بنجاح')).toBeVisible();
    
    // 7. إنشاء قيد يومية
    await page.click('text=القيود اليومية');
    await page.click('button:has-text("إضافة قيد")');
    await page.fill('[name="description"]', 'قيد اختبار');
    await page.fill('[name="debit_amount"]', '50000');
    await page.fill('[name="credit_amount"]', '50000');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إضافة القيد بنجاح')).toBeVisible();
    
    // 8. عرض ميزان المراجعة
    await page.click('text=ميزان المراجعة');
    await expect(page.locator('[data-testid="trial-balance"]')).toBeVisible();
    
    // 9. تصدير التقرير
    await page.click('button:has-text("تصدير")');
    await expect(page.locator('text=تم التصدير بنجاح')).toBeVisible();
    
    // 10. تسجيل الخروج
    await logout(page);
    await expect(page).toHaveURL('/auth');
  });
  
  test('Bank reconciliation workflow', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    await navigateTo(page, '/accounting');
    await page.click('text=الحسابات البنكية');
    
    // فتح التسوية البنكية
    await page.click('button:has-text("تسوية بنكية")');
    await expect(page.locator('[data-testid="reconciliation-dialog"]')).toBeVisible();
    
    // إدخال بيانات الكشف البنكي
    await page.fill('[name="statement_date"]', '2025-01-15');
    await page.fill('[name="opening_balance"]', '100000');
    await page.fill('[name="closing_balance"]', '150000');
    
    await page.click('button:has-text("بدء التسوية")');
    await expect(page.locator('text=تمت التسوية بنجاح')).toBeVisible();
    
    await logout(page);
  });
});
