import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة الميزانيات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/budgets');
  });

  test('عرض قائمة الميزانيات', async ({ page }) => {
    await expectVisible(page, 'text=الميزانيات');
    await expectVisible(page, 'button:has-text("ميزانية جديدة")');
  });

  test('إنشاء ميزانية سنوية', async ({ page }) => {
    await page.click('button:has-text("ميزانية جديدة")');
    
    await expectVisible(page, 'text=ميزانية جديدة');
    await page.fill('input[name="name"]', 'ميزانية 2024');
    await page.fill('input[name="year"]', '2024');
    await page.click('button:has-text("إنشاء")');
    
    await expectToast(page, 'تم إنشاء الميزانية');
  });

  test('عرض تنفيذ الميزانية', async ({ page }) => {
    await page.click('text=تنفيذ الميزانية');
    
    await expectVisible(page, 'text=نسبة التنفيذ');
    await expectVisible(page, 'text=المصروفات الفعلية');
  });

  test('تعديل بنود الميزانية', async ({ page }) => {
    const firstBudget = page.locator('[data-testid="budget-card"]').first();
    if (await firstBudget.count() > 0) {
      await firstBudget.click();
      await page.click('button:has-text("تعديل البنود")');
      
      await expectVisible(page, 'text=بنود الميزانية');
    }
  });

  test('تقارير الميزانية', async ({ page }) => {
    await page.click('text=التقارير');
    
    await expectVisible(page, 'text=تقارير الميزانية');
    await expectVisible(page, 'button:has-text("تصدير")');
  });
});
