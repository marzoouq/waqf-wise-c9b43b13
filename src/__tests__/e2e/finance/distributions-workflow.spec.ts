import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('سير عمل التوزيعات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/distributions');
  });

  test('عرض قائمة التوزيعات', async ({ page }) => {
    await expectVisible(page, 'text=إدارة التوزيعات');
    await expectVisible(page, 'button:has-text("توزيع جديد")');
    
    const distributionsCount = await page.locator('[data-testid="distribution-card"]').count();
    expect(distributionsCount).toBeGreaterThan(0);
  });

  test('إنشاء توزيع جديد', async ({ page }) => {
    await page.click('button:has-text("توزيع جديد")');
    
    await expectVisible(page, 'text=توزيع جديد');
    await expectVisible(page, 'input[name="distribution_name"]');
    await expectVisible(page, 'input[name="total_amount"]');
  });

  test('محاكاة توزيع', async ({ page }) => {
    await page.click('button:has-text("توزيع جديد")');
    
    await page.fill('input[name="distribution_name"]', 'توزيع تجريبي');
    await page.fill('input[name="total_amount"]', '500000');
    await page.click('button:has-text("محاكاة")');
    
    await expectVisible(page, 'text=نتائج المحاكاة');
    await expectVisible(page, 'text=صافي التوزيع');
  });

  test('اعتماد توزيع', async ({ page }) => {
    // البحث عن توزيع معلق
    const pendingDistribution = page.locator('[data-status="معلق"]').first();
    
    if (await pendingDistribution.isVisible()) {
      await pendingDistribution.click();
      await page.click('button:has-text("اعتماد")');
      
      await expectToast(page, 'تم اعتماد التوزيع بنجاح');
    }
  });

  test('عرض تفاصيل التوزيع', async ({ page }) => {
    await page.locator('[data-testid="distribution-card"]').first().click();
    
    await expectVisible(page, 'text=تفاصيل التوزيع');
    await expectVisible(page, 'text=المستفيدون');
    await expectVisible(page, 'text=الاستقطاعات');
  });

  test('تصدير ملف التحويل البنكي', async ({ page }) => {
    await page.locator('[data-status="معتمد"]').first().click();
    await page.click('button:has-text("تصدير ملف بنكي")');
    
    await expectVisible(page, 'text=تصدير ملف التحويل');
    await expectVisible(page, 'select[name="file_format"]');
  });
});
