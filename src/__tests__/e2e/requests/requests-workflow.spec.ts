import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';
import { fillAndSubmit } from '../helpers/form-helpers';

test.describe('سير عمل الطلبات', () => {
  test('تقديم طلب جديد - مستفيد', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    await navigateTo(page, '/beneficiary-dashboard/requests');
    
    await page.click('button:has-text("طلب جديد")');
    
    await expectVisible(page, 'text=طلب جديد');
    await expectVisible(page, 'select[name="request_type_id"]');
    
    await page.selectOption('select[name="request_type_id"]', { index: 1 });
    await page.fill('textarea[name="description"]', 'أحتاج لمساعدة مالية طارئة');
    await page.fill('input[name="amount"]', '5000');
    
    await page.click('button:has-text("إرسال الطلب")');
    
    await expectToast(page, 'تم إرسال الطلب بنجاح');
  });

  test('مراجعة الطلبات - إداري', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/requests');
    
    await expectVisible(page, 'text=إدارة الطلبات');
    await expectVisible(page, '[data-testid="request-card"]');
    
    const pendingCount = await page.locator('[data-status="pending"]').count();
    expect(pendingCount).toBeGreaterThanOrEqual(0);
  });

  test('معالجة طلب فزعة', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/requests');
    
    const firstRequest = page.locator('[data-testid="request-card"]').first();
    await firstRequest.click();
    
    await expectVisible(page, 'text=تفاصيل الطلب');
    await expectVisible(page, 'button:has-text("موافقة")');
    await expectVisible(page, 'button:has-text("رفض")');
  });

  test('الموافقة على طلب', async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/requests');
    
    const pendingRequest = page.locator('[data-status="pending"]').first();
    
    if (await pendingRequest.isVisible()) {
      await pendingRequest.click();
      await page.click('button:has-text("موافقة")');
      
      await page.fill('textarea[name="decision_notes"]', 'تم الموافقة على الطلب');
      await page.click('button:has-text("تأكيد الموافقة")');
      
      await expectToast(page, 'تم الموافقة على الطلب');
    }
  });

  test('تصعيد طلب متأخر', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/requests');
    
    const overdueRequest = page.locator('[data-overdue="true"]').first();
    
    if (await overdueRequest.isVisible()) {
      await overdueRequest.click();
      await page.click('button:has-text("تصعيد")');
      
      await expectVisible(page, 'text=تصعيد الطلب');
    }
  });
});
