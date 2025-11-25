import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { expectVisible, expectText } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم المستفيد', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'beneficiary');
  });

  test('عرض الإحصائيات الرئيسية', async ({ page }) => {
    await expectVisible(page, '[data-testid="beneficiary-stats"]');
    await expectVisible(page, 'text=إجمالي المستحقات');
    await expectVisible(page, 'text=الطلبات النشطة');
    await expectVisible(page, 'text=آخر دفعة');
  });

  test('عرض آخر التوزيعات', async ({ page }) => {
    await expectVisible(page, 'text=آخر التوزيعات');
    
    const distributionsCount = await page.locator('[data-testid="distribution-item"]').count();
    expect(distributionsCount).toBeGreaterThan(0);
  });

  test('عرض الطلبات النشطة', async ({ page }) => {
    await page.click('text=طلباتي');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=الطلبات');
    await expectVisible(page, 'button:has-text("طلب جديد")');
  });

  test('عرض المستندات', async ({ page }) => {
    await page.click('text=مستنداتي');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=المستندات');
  });

  test('تقديم طلب جديد', async ({ page }) => {
    await page.click('text=طلباتي');
    await page.click('button:has-text("طلب جديد")');
    
    await expectVisible(page, 'text=طلب جديد');
    await expectVisible(page, 'select[name="request_type"]');
    await expectVisible(page, 'textarea[name="description"]');
  });

  test('عرض كشف الحساب', async ({ page }) => {
    await page.click('text=كشف الحساب');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=كشف الحساب');
    await expectVisible(page, 'text=المدفوعات');
  });
});
