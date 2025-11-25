import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('منشئ التقارير المخصصة', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/custom-reports');
  });

  test('فتح منشئ التقارير', async ({ page }) => {
    await expectVisible(page, 'text=منشئ التقارير المخصصة');
    await expectVisible(page, 'button:has-text("تقرير جديد")');
  });

  test('إنشاء تقرير مخصص', async ({ page }) => {
    await page.click('button:has-text("تقرير جديد")');
    
    await expectVisible(page, 'text=تقرير مخصص جديد');
    await expectVisible(page, 'input[name="report_name"]');
    await expectVisible(page, 'select[name="data_source"]');
  });

  test('اختيار الحقول', async ({ page }) => {
    await page.click('button:has-text("تقرير جديد")');
    await page.selectOption('select[name="data_source"]', 'beneficiaries');
    
    await expectVisible(page, 'text=اختر الحقول');
    await expectVisible(page, '[data-testid="field-selector"]');
  });

  test('تطبيق الفلاتر', async ({ page }) => {
    await page.click('button:has-text("تقرير جديد")');
    await page.click('button:has-text("إضافة فلتر")');
    
    await expectVisible(page, 'select[name="filter_field"]');
    await expectVisible(page, 'select[name="filter_operator"]');
  });

  test('معاينة التقرير', async ({ page }) => {
    const savedReport = page.locator('[data-testid="saved-report"]').first();
    if (await savedReport.count() > 0) {
      await savedReport.click();
      await page.click('button:has-text("معاينة")');
      
      await expectVisible(page, 'text=معاينة التقرير');
    }
  });

  test('تصدير التقرير المخصص', async ({ page }) => {
    const savedReport = page.locator('[data-testid="saved-report"]').first();
    if (await savedReport.count() > 0) {
      await savedReport.click();
      await page.click('button:has-text("تصدير")');
      
      await expectVisible(page, 'text=تصدير التقرير');
    }
  });

  test('جدولة تقرير دوري', async ({ page }) => {
    const savedReport = page.locator('[data-testid="saved-report"]').first();
    if (await savedReport.count() > 0) {
      await savedReport.click();
      await page.click('button:has-text("جدولة")');
      
      await expectVisible(page, 'text=جدولة التقرير');
      await expectVisible(page, 'select[name="frequency"]');
    }
  });
});
