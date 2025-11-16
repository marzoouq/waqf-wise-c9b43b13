import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Property and Rental Management', () => {
  test('Complete property management workflow', async ({ page }) => {
    await loginAs(page, 'admin');
    
    // 1. الانتقال إلى العقارات
    await navigateTo(page, '/properties');
    await expect(page).toHaveURL('/properties');
    
    // 2. إضافة عقار جديد
    await page.click('button:has-text("إضافة عقار")');
    await page.fill('[name="name"]', 'محل تجاري - شارع العليا');
    await page.selectOption('[name="type"]', 'commercial');
    await page.fill('[name="location"]', 'الرياض - حي العليا');
    await page.fill('[name="units"]', '1');
    await page.fill('[name="monthly_revenue"]', '15000');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إضافة العقار')).toBeVisible();
    
    // 3. إنشاء عقد إيجار
    await page.click('text=العقود');
    await page.click('button:has-text("عقد جديد")');
    await page.fill('[name="contract_number"]', 'CONT-2025-001');
    await page.fill('[name="tenant_name"]', 'شركة التجارة الحديثة');
    await page.fill('[name="tenant_phone"]', '0501234567');
    await page.fill('[name="tenant_id_number"]', '1234567890');
    await page.fill('[name="start_date"]', '2025-01-01');
    await page.fill('[name="end_date"]', '2025-12-31');
    await page.fill('[name="monthly_rent"]', '15000');
    await page.selectOption('[name="payment_frequency"]', 'monthly');
    await page.click('button:has-text("حفظ العقد")');
    await expect(page.locator('text=تم إنشاء العقد')).toBeVisible();
    
    // 4. توليد جدول دفعات
    await expect(page.locator('[data-testid="payment-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-row"]')).toHaveCount(12);
    
    // 5. تسجيل دفعة إيجار
    await page.click('text=الدفعات');
    await page.click('[data-testid="payment-row"]:first-child >> button:has-text("تسجيل دفع")');
    await page.fill('[name="payment_date"]', '2025-01-05');
    await page.fill('[name="amount"]', '15000');
    await page.selectOption('[name="payment_method"]', 'bank_transfer');
    await page.fill('[name="reference_number"]', 'BT-20250105');
    await page.click('button:has-text("تأكيد الدفع")');
    await expect(page.locator('text=تم تسجيل الدفعة')).toBeVisible();
    
    // 6. إنشاء طلب صيانة
    await page.click('text=الصيانة');
    await page.click('button:has-text("طلب صيانة")');
    await page.fill('[name="description"]', 'إصلاح تسريب مياه');
    await page.selectOption('[name="priority"]', 'high');
    await page.fill('[name="estimated_cost"]', '3000');
    await page.click('button:has-text("تقديم الطلب")');
    await expect(page.locator('text=تم إنشاء طلب الصيانة')).toBeVisible();
    
    // 7. تحديث حالة العقار
    await page.click('text=تفاصيل العقار');
    await expect(page.locator('[data-testid="property-status"]')).toHaveText('occupied');
    
    // 8. عرض تقرير أداء العقارات
    await navigateTo(page, '/reports');
    await page.click('text=تقارير العقارات');
    await page.selectOption('[name="report_type"]', 'property_performance');
    await page.click('button:has-text("عرض التقرير")');
    await expect(page.locator('[data-testid="property-report"]')).toBeVisible();
    
    // 9. تصدير التقرير
    await page.click('button:has-text("تصدير PDF")');
    await page.waitForTimeout(2000);
    
    await logout(page);
  });
  
  test('Contract renewal workflow', async ({ page }) => {
    await loginAs(page, 'admin');
    
    await navigateTo(page, '/properties');
    await page.click('text=العقود');
    
    // فتح عقد قارب على الانتهاء
    await page.click('[data-testid="contract-item"]:first-child');
    
    // تجديد العقد
    await page.click('button:has-text("تجديد العقد")');
    await page.fill('[name="new_start_date"]', '2026-01-01');
    await page.fill('[name="new_end_date"]', '2026-12-31');
    await page.fill('[name="new_monthly_rent"]', '16000');
    await page.fill('[name="rent_increase_percentage"]', '6.67');
    await page.click('button:has-text("تأكيد التجديد")');
    
    await expect(page.locator('text=تم تجديد العقد')).toBeVisible();
    
    await logout(page);
  });
});
