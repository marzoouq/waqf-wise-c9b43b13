import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة العائلات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/families');
  });

  test('عرض قائمة العائلات', async ({ page }) => {
    await expectVisible(page, 'text=إدارة العائلات');
    await expectVisible(page, 'button:has-text("عائلة جديدة")');
    
    const familiesCount = await page.locator('[data-testid="family-card"]').count();
    expect(familiesCount).toBeGreaterThan(0);
  });

  test('عرض شجرة العائلة', async ({ page }) => {
    await page.locator('[data-testid="family-card"]').first().click();
    
    await expectVisible(page, 'text=شجرة العائلة');
    await expectVisible(page, '[data-testid="family-member"]');
  });

  test('إضافة فرد للعائلة', async ({ page }) => {
    await page.locator('[data-testid="family-card"]').first().click();
    await page.click('button:has-text("إضافة فرد")');
    
    await expectVisible(page, 'text=إضافة فرد للعائلة');
    await expectVisible(page, 'select[name="relationship"]');
  });

  test('فصل فرد من العائلة', async ({ page }) => {
    await page.locator('[data-testid="family-card"]').first().click();
    
    const memberCount = await page.locator('[data-testid="family-member"]').count();
    if (memberCount > 1) {
      const member = page.locator('[data-testid="family-member"]').nth(1);
      await member.hover();
      await member.locator('button:has-text("فصل")').click();
      
      await expectVisible(page, 'text=تأكيد الفصل');
    }
  });
});
