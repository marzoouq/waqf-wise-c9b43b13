import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('التقارير وتوليدها', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/reports');
  });

  test('عرض صفحة التقارير', async ({ page }) => {
    await expectVisible(page, 'text=التقارير');
    await expectVisible(page, 'text=التقارير المالية');
    await expectVisible(page, 'text=تقارير المستفيدين');
    await expectVisible(page, 'text=تقارير العقارات');
  });

  test('توليد تقرير ميزان المراجعة', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    
    await expectVisible(page, 'text=ميزان المراجعة');
    await expectVisible(page, 'button:has-text("تصدير PDF")');
    await expectVisible(page, 'button:has-text("تصدير Excel")');
  });

  test('تصدير تقرير إلى PDF', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("تصدير PDF")'),
    ]);
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('تصدير تقرير إلى Excel', async ({ page }) => {
    await page.click('text=قائمة المستفيدين');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("تصدير Excel")'),
    ]);
    
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('منشئ التقارير المخصصة', async ({ page }) => {
    await navigateTo(page, '/reports/builder');
    
    await expectVisible(page, 'text=منشئ التقارير');
    await expectVisible(page, 'text=اختر نوع التقرير');
    await expectVisible(page, 'text=الحقول');
    await expectVisible(page, 'text=الفلاتر');
  });

  test('عرض الرؤى الذكية', async ({ page }) => {
    await navigateTo(page, '/insights');
    
    await expectVisible(page, 'text=الرؤى الذكية');
    await expectVisible(page, '[data-testid="insight-card"]');
  });
});
