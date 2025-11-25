import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { expectVisible } from '../helpers/assertion-helpers';
import { waitForDataLoad } from '../helpers/wait-helpers';

test.describe('التقارير المالية', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await page.click('text=التقارير');
    await waitForDataLoad(page);
  });

  test('عرض ميزان المراجعة', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    await waitForDataLoad(page);
    
    await expectVisible(page, 'text=ميزان المراجعة');
    await expectVisible(page, 'text=مدين');
    await expectVisible(page, 'text=دائن');
    
    const accountRows = await page.locator('[data-testid="account-row"]').count();
    expect(accountRows).toBeGreaterThan(0);
  });

  test('عرض قائمة الدخل', async ({ page }) => {
    await page.click('text=قائمة الدخل');
    await waitForDataLoad(page);
    
    await expectVisible(page, 'text=قائمة الدخل');
    await expectVisible(page, 'text=الإيرادات');
    await expectVisible(page, 'text=المصروفات');
    await expectVisible(page, 'text=صافي الدخل');
  });

  test('عرض المركز المالي', async ({ page }) => {
    await page.click('text=المركز المالي');
    await waitForDataLoad(page);
    
    await expectVisible(page, 'text=المركز المالي');
    await expectVisible(page, 'text=الأصول');
    await expectVisible(page, 'text=الخصوم');
    await expectVisible(page, 'text=حقوق الملكية');
  });

  test('فلترة التقارير حسب الفترة', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    
    const startDate = new Date('2024-01-01').toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    await page.fill('input[name="start_date"]', startDate);
    await page.fill('input[name="end_date"]', endDate);
    await page.click('button:has-text("تطبيق")');
    
    await waitForDataLoad(page);
    await expectVisible(page, 'text=ميزان المراجعة');
  });

  test('تصدير تقرير PDF', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    await waitForDataLoad(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("تصدير PDF")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('تصدير تقرير Excel', async ({ page }) => {
    await page.click('text=قائمة الدخل');
    await waitForDataLoad(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("تصدير Excel")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });

  test('طباعة تقرير', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    await waitForDataLoad(page);
    
    const printPromise = page.waitForEvent('popup');
    await page.click('button:has-text("طباعة")');
    const printPage = await printPromise;
    
    expect(printPage.url()).toContain('print');
  });
});
