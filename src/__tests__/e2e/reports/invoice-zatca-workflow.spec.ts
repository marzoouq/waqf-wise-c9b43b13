import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('ZATCA-Compliant Invoice Workflow', () => {
  test('Complete invoice lifecycle', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    // 1. الانتقال إلى الفواتير
    await navigateTo(page, '/invoices');
    await expect(page).toHaveURL('/invoices');
    
    // 2. إنشاء فاتورة متوافقة مع ZATCA
    await page.click('button:has-text("فاتورة جديدة")');
    
    // معلومات الفاتورة الأساسية
    await page.fill('[name="invoice_number"]', 'INV-2025-001');
    await page.fill('[name="invoice_date"]', '2025-01-15');
    await page.selectOption('[name="invoice_type"]', 'tax_invoice');
    
    // معلومات العميل
    await page.fill('[name="customer_name"]', 'شركة التطوير العقاري');
    await page.fill('[name="customer_vat_number"]', '300123456789003');
    await page.fill('[name="customer_address"]', 'الرياض - حي الملك فهد');
    
    // بنود الفاتورة
    await page.click('button:has-text("إضافة بند")');
    await page.fill('[name="item_description_0"]', 'إيجار محل تجاري');
    await page.fill('[name="quantity_0"]', '1');
    await page.fill('[name="unit_price_0"]', '15000');
    await page.fill('[name="tax_rate_0"]', '15');
    
    // التحقق من حساب الضريبة
    await expect(page.locator('[data-testid="subtotal"]')).toHaveText('15,000.00');
    await expect(page.locator('[data-testid="tax_amount"]')).toHaveText('2,250.00');
    await expect(page.locator('[data-testid="total"]')).toHaveText('17,250.00');
    
    // حفظ الفاتورة
    await page.click('button:has-text("حفظ الفاتورة")');
    await expect(page.locator('text=تم إنشاء الفاتورة')).toBeVisible();
    
    // 3. التحقق من توليد QR Code
    await expect(page.locator('[data-testid="zatca-qr-code"]')).toBeVisible();
    
    // 4. عرض معاينة الفاتورة
    await page.click('button:has-text("معاينة")');
    await expect(page.locator('[data-testid="invoice-preview"]')).toBeVisible();
    
    // التحقق من وجود جميع العناصر المطلوبة لـ ZATCA
    await expect(page.locator('text=شركة التطوير العقاري')).toBeVisible();
    await expect(page.locator('text=300123456789003')).toBeVisible();
    await expect(page.locator('[data-testid="qr-code-image"]')).toBeVisible();
    await expect(page.locator('text=17,250.00')).toBeVisible();
    
    // 5. إرسال بالبريد الإلكتروني
    await page.click('button:has-text("إرسال بريد")');
    await page.fill('[name="email"]', 'finance@customer.com');
    await page.fill('[name="subject"]', 'فاتورة رقم INV-2025-001');
    await page.click('button:has-text("إرسال")');
    await expect(page.locator('text=تم إرسال الفاتورة')).toBeVisible();
    
    // 6. تسجيل الدفع
    await page.click('button:has-text("تسجيل دفع")');
    await page.fill('[name="payment_date"]', '2025-01-20');
    await page.fill('[name="amount"]', '17250');
    await page.selectOption('[name="payment_method"]', 'bank_transfer');
    await page.fill('[name="reference_number"]', 'BT-20250120');
    await page.click('button:has-text("تأكيد الدفع")');
    await expect(page.locator('text=تم تسجيل الدفع')).toBeVisible();
    
    // 7. تحديث حالة الفاتورة
    await expect(page.locator('[data-testid="invoice-status"]')).toHaveText('paid');
    
    // 8. التحقق من القيد المحاسبي
    await navigateTo(page, '/accounting');
    await page.click('text=القيود اليومية');
    await expect(page.locator('text=INV-2025-001')).toBeVisible();
    
    // 9. تصدير XML للزكاة والدخل
    await navigateTo(page, '/invoices');
    await page.click('[data-testid="invoice-item"]:first-child');
    await page.click('button:has-text("تصدير XML")');
    await page.waitForTimeout(2000);
    
    // 10. تصدير PDF
    await page.click('button:has-text("تصدير PDF")');
    await page.waitForTimeout(2000);
    
    await logout(page);
  });
  
  test('Credit note workflow', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    await navigateTo(page, '/invoices');
    
    // إنشاء إشعار دائن (Credit Note)
    await page.click('[data-testid="invoice-item"]:first-child');
    await page.click('button:has-text("إشعار دائن")');
    
    await page.fill('[name="reason"]', 'خصم تجاري');
    await page.fill('[name="amount"]', '1000');
    await page.click('button:has-text("إنشاء الإشعار")');
    
    await expect(page.locator('text=تم إنشاء الإشعار الدائن')).toBeVisible();
    await expect(page.locator('[data-testid="zatca-qr-code"]')).toBeVisible();
    
    await logout(page);
  });
});
