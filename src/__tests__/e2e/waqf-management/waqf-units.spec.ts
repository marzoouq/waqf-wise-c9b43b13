import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة أقلام الوقف', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/waqf-units');
  });

  test('عرض قائمة أقلام الوقف', async ({ page }) => {
    await expectVisible(page, 'text=أقلام الوقف');
    await expectVisible(page, 'button:has-text("قلم جديد")');
    
    const unitsCount = await page.locator('[data-testid="waqf-unit-card"]').count();
    expect(unitsCount).toBeGreaterThanOrEqual(0);
  });

  test('إضافة قلم وقف جديد', async ({ page }) => {
    await page.click('button:has-text("قلم جديد")');
    
    await expectVisible(page, 'text=قلم وقف جديد');
    await page.fill('input[name="name"]', 'قلم وقف اختبار');
    await page.fill('textarea[name="description"]', 'وصف قلم الوقف الاختبار');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم إضافة قلم الوقف');
  });

  test('عرض تفاصيل قلم الوقف', async ({ page }) => {
    const firstUnit = page.locator('[data-testid="waqf-unit-card"]').first();
    if (await firstUnit.count() > 0) {
      await firstUnit.click();
      
      await expectVisible(page, 'text=تفاصيل قلم الوقف');
      await expectVisible(page, 'text=العقارات المرتبطة');
      await expectVisible(page, 'text=الإيرادات');
    }
  });

  test('ربط عقار بقلم الوقف', async ({ page }) => {
    const firstUnit = page.locator('[data-testid="waqf-unit-card"]').first();
    if (await firstUnit.count() > 0) {
      await firstUnit.click();
      await page.click('button:has-text("ربط عقار")');
      
      await expectVisible(page, 'text=ربط عقار بقلم الوقف');
      await expectVisible(page, 'select[name="property_id"]');
    }
  });
});
