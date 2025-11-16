import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Beneficiary Portal Journey', () => {
  test('Complete beneficiary workflow', async ({ page }) => {
    // 1. تسجيل الدخول كمستفيد
    await loginAs(page, 'beneficiary');
    
    // 2. التحقق من الوصول إلى لوحة تحكم المستفيد
    await expect(page).toHaveURL(/\/beneficiary-dashboard/);
    await expect(page.locator('h1')).toContainText('لوحة تحكم المستفيد');
    
    // 3. عرض الملف الشخصي
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-stats"]')).toBeVisible();
    
    // 4. عرض تاريخ المدفوعات
    await page.click('text=المدفوعات');
    await expect(page.locator('[data-testid="payments-history"]')).toBeVisible();
    
    // 5. تقديم طلب فزعة طارئة
    await page.click('text=الطلبات');
    await page.click('button:has-text("طلب جديد")');
    await page.selectOption('[name="request_type"]', 'emergency');
    await page.fill('[name="description"]', 'فزعة طارئة - نفقات طبية');
    await page.fill('[name="amount"]', '10000');
    await page.click('button:has-text("تقديم الطلب")');
    await expect(page.locator('text=تم تقديم الطلب بنجاح')).toBeVisible();
    
    // 6. رفع مستندات داعمة
    await page.click('button:has-text("رفع مستندات")');
    await page.fill('[name="document_type"]', 'medical_report');
    // محاكاة رفع ملف
    await page.click('button:has-text("رفع")');
    await expect(page.locator('text=تم رفع المستند')).toBeVisible();
    
    // 7. متابعة حالة الطلب
    await page.click('text=طلباتي');
    await expect(page.locator('[data-testid="request-status"]')).toHaveText(/قيد المراجعة|معلق/);
    
    // 8. عرض كشف الحساب
    await page.click('text=كشف الحساب');
    await expect(page.locator('[data-testid="account-statement"]')).toBeVisible();
    
    // 9. طباعة شهادة تعريف
    await page.click('button:has-text("طباعة شهادة")');
    await expect(page.locator('[data-testid="certificate-preview"]')).toBeVisible();
    
    // 10. تسجيل الخروج
    await logout(page);
  });
  
  test('Update personal information', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    
    // تحديث البيانات الشخصية
    await navigateTo(page, '/beneficiary-dashboard');
    await page.click('button:has-text("تحديث البيانات")');
    
    await page.fill('[name="phone"]', '0501234567');
    await page.fill('[name="address"]', 'عنوان جديد');
    await page.click('button:has-text("حفظ التعديلات")');
    
    await expect(page.locator('text=تم تحديث البيانات')).toBeVisible();
    
    await logout(page);
  });
  
  test('View notifications and messages', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    
    // عرض الإشعارات
    await page.click('[data-testid="notifications-bell"]');
    await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
    
    // فتح إشعار
    await page.click('[data-testid="notification-item"]:first-child');
    await expect(page.locator('[data-testid="notification-details"]')).toBeVisible();
    
    // عرض الرسائل الداخلية
    await page.click('text=الرسائل');
    await expect(page.locator('[data-testid="messages-inbox"]')).toBeVisible();
    
    await logout(page);
  });
});
