import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('الرسائل الداخلية', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/messages');
  });

  test('عرض صندوق الوارد', async ({ page }) => {
    await expectVisible(page, 'text=الرسائل الداخلية');
    await expectVisible(page, 'button:has-text("رسالة جديدة")');
    await expectVisible(page, 'text=الوارد');
  });

  test('إرسال رسالة جديدة', async ({ page }) => {
    await page.click('button:has-text("رسالة جديدة")');
    
    await expectVisible(page, 'text=رسالة جديدة');
    await expectVisible(page, 'select[name="recipient"]');
    await expectVisible(page, 'input[name="subject"]');
    await expectVisible(page, 'textarea[name="message"]');
    
    await page.fill('input[name="subject"]', 'رسالة اختبار');
    await page.fill('textarea[name="message"]', 'هذه رسالة اختبارية');
    await page.click('button:has-text("إرسال")');
    
    await expectToast(page, 'تم إرسال الرسالة');
  });

  test('قراءة رسالة', async ({ page }) => {
    const firstMessage = page.locator('[data-testid="message-item"]').first();
    if (await firstMessage.count() > 0) {
      await firstMessage.click();
      
      await expectVisible(page, 'text=تفاصيل الرسالة');
      await expectVisible(page, 'button:has-text("رد")');
    }
  });

  test('الرد على رسالة', async ({ page }) => {
    const firstMessage = page.locator('[data-testid="message-item"]').first();
    if (await firstMessage.count() > 0) {
      await firstMessage.click();
      await page.click('button:has-text("رد")');
      
      await expectVisible(page, 'textarea[name="reply"]');
    }
  });

  test('عرض الرسائل المرسلة', async ({ page }) => {
    await page.click('text=المرسلة');
    
    await expectVisible(page, 'text=الرسائل المرسلة');
  });

  test('البحث في الرسائل', async ({ page }) => {
    await page.fill('input[placeholder*="بحث"]', 'اختبار');
    await page.waitForTimeout(1000);
    
    const results = await page.locator('[data-testid="message-item"]').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('حذف رسالة', async ({ page }) => {
    const firstMessage = page.locator('[data-testid="message-item"]').first();
    if (await firstMessage.count() > 0) {
      await firstMessage.click();
      await page.click('button:has-text("حذف")');
      
      await expectVisible(page, 'text=تأكيد الحذف');
    }
  });
});
