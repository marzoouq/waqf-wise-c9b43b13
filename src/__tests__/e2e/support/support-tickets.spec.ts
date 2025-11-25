import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('تذاكر الدعم', () => {
  test('إنشاء تذكرة دعم - مستفيد', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    await navigateTo(page, '/beneficiary-dashboard/support');
    
    await page.click('button:has-text("تذكرة جديدة")');
    
    await expectVisible(page, 'text=تذكرة دعم جديدة');
    
    await page.fill('input[name="subject"]', 'مشكلة في الدخول');
    await page.fill('textarea[name="description"]', 'لا أستطيع تسجيل الدخول للحساب');
    await page.selectOption('select[name="priority"]', 'high');
    
    await page.click('button:has-text("إرسال")');
    
    await expectToast(page, 'تم إرسال التذكرة بنجاح');
  });

  test('إدارة التذاكر - دعم فني', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/support-tickets');
    
    await expectVisible(page, 'text=تذاكر الدعم');
    await expectVisible(page, '[data-testid="ticket-card"]');
  });

  test('الرد على تذكرة', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/support-tickets');
    
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();
    
    await expectVisible(page, 'text=تفاصيل التذكرة');
    
    await page.fill('textarea[name="reply"]', 'شكراً لتواصلك، سيتم حل المشكلة قريباً');
    await page.click('button:has-text("إرسال الرد")');
    
    await expectToast(page, 'تم إرسال الرد');
  });

  test('إغلاق تذكرة', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/support-tickets');
    
    const openTicket = page.locator('[data-status="open"]').first();
    
    if (await openTicket.isVisible()) {
      await openTicket.click();
      await page.click('button:has-text("إغلاق التذكرة")');
      
      await expectToast(page, 'تم إغلاق التذكرة');
    }
  });
});
