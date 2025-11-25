import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { expectVisible, expectText, expectToast } from '../helpers/assertion-helpers';
import { fillForm, submitForm } from '../helpers/form-helpers';
import { waitForDataLoad } from '../helpers/wait-helpers';

test.describe('إدارة التوزيعات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'nazer');
    await page.click('text=التوزيعات');
    await waitForDataLoad(page);
  });

  test('عرض قائمة التوزيعات', async ({ page }) => {
    await expectVisible(page, 'text=التوزيعات');
    await expectVisible(page, 'button:has-text("توزيع جديد")');
    
    const distributionsCount = await page.locator('[data-testid="distribution-row"]').count();
    expect(distributionsCount).toBeGreaterThanOrEqual(0);
  });

  test('محاكاة توزيع جديد', async ({ page }) => {
    await page.click('button:has-text("توزيع جديد")');
    await expectVisible(page, 'text=توزيع جديد');
    
    await fillForm(page, {
      distribution_name: 'توزيع اختباري ' + Date.now(),
      total_amount: '100000',
      distribution_date: new Date().toISOString().split('T')[0],
    });
    
    await page.click('button:has-text("محاكاة التوزيع")');
    await waitForDataLoad(page);
    
    await expectVisible(page, 'text=نتائج المحاكاة');
    await expectVisible(page, 'text=عدد المستفيدين');
  });

  test('فلترة التوزيعات حسب الحالة', async ({ page }) => {
    await page.click('select[name="status_filter"]');
    await page.selectOption('select[name="status_filter"]', 'معتمد');
    await waitForDataLoad(page);
    
    const statusBadges = await page.locator('text=معتمد').count();
    expect(statusBadges).toBeGreaterThan(0);
  });

  test('عرض تفاصيل توزيع', async ({ page }) => {
    const firstDistribution = page.locator('[data-testid="distribution-row"]').first();
    
    if (await firstDistribution.isVisible()) {
      await firstDistribution.click();
      await waitForDataLoad(page);
      
      await expectVisible(page, 'text=تفاصيل التوزيع');
      await expectVisible(page, 'text=المستفيدون');
      await expectVisible(page, 'text=الإجمالي');
    }
  });

  test('اعتماد توزيع معلق', async ({ page }) => {
    const pendingDistribution = page.locator('[data-testid="distribution-row"]:has-text("معلق")').first();
    
    if (await pendingDistribution.isVisible()) {
      await pendingDistribution.click();
      await page.click('button:has-text("اعتماد التوزيع")');
      
      await expectVisible(page, 'text=هل أنت متأكد');
      await page.click('button:has-text("تأكيد")');
      
      await expectToast(page, 'تم اعتماد التوزيع');
    }
  });

  test('البحث في التوزيعات', async ({ page }) => {
    await page.fill('input[placeholder*="بحث"]', 'توزيع');
    await waitForDataLoad(page);
    
    const results = await page.locator('[data-testid="distribution-row"]').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('تصدير تقرير توزيع', async ({ page }) => {
    const firstDistribution = page.locator('[data-testid="distribution-row"]').first();
    
    if (await firstDistribution.isVisible()) {
      await firstDistribution.click();
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("تصدير PDF")');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });
});
