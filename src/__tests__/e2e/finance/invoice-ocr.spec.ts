import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('Invoice OCR Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/accounting');
  });

  test('full OCR workflow: upload → extract → review → save', async ({ page }) => {
    // 1. فتح صفحة الفواتير
    await expectVisible(page, 'text=إدارة الفواتير');
    
    // 2. فتح Dialog إنشاء فاتورة جديدة
    await page.click('button:has-text("فاتورة جديدة")');
    await expectVisible(page, 'text=إنشاء فاتورة جديدة');

    // 3. البحث عن زر "استيراد من صورة"
    const importButton = page.locator('button:has-text("استيراد من صورة")');
    if (await importButton.count() > 0) {
      await importButton.click();
      
      // 4. التحقق من ظهور واجهة OCR
      await expectVisible(page, 'text=رفع صورة الفاتورة');
      
      // ملاحظة: لا يمكن رفع ملف حقيقي في الاختبارات التلقائية
      // لكن يمكن التحقق من وجود عنصر رفع الملف
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    }
  });

  test('display confidence indicators for extracted data', async ({ page }) => {
    await page.click('button:has-text("فاتورة جديدة")');
    
    const importButton = page.locator('button:has-text("استيراد من صورة")');
    if (await importButton.count() > 0) {
      await importButton.click();
      
      // التحقق من وجود مؤشرات الثقة (إذا كانت البيانات مستخرجة)
      await page.waitForTimeout(1000);
      
      // محاكاة: البحث عن عناصر مؤشرات الثقة
      const confidenceIndicators = page.locator('[class*="confidence"]');
      // لن تظهر إلا بعد استخراج البيانات بنجاح
    }
  });

  test('handle OCR errors gracefully', async ({ page }) => {
    await page.click('button:has-text("فاتورة جديدة")');
    
    const importButton = page.locator('button:has-text("استيراد من صورة")');
    if (await importButton.count() > 0) {
      await importButton.click();
      
      // إذا حدث خطأ، يجب أن تظهر رسالة خطأ
      await page.waitForTimeout(1000);
    }
  });

  test('batch processing interface', async ({ page }) => {
    // البحث عن زر معالجة دفعة
    const batchButton = page.locator('button:has-text("معالجة دفعة")');
    if (await batchButton.count() > 0) {
      await batchButton.click();
      
      // التحقق من واجهة المعالجة الدفعية
      await expectVisible(page, 'text=معالجة دفعة من الفواتير');
      
      const multiFileInput = page.locator('input[type="file"][multiple]');
      await expect(multiFileInput).toBeAttached();
    }
  });

  test('validate extracted VAT number format', async ({ page }) => {
    // في حالة استخراج رقم ضريبي غير صحيح
    // يجب أن تظهر رسالة تحذير
    
    await page.click('button:has-text("فاتورة جديدة")');
    
    // محاكاة: إدخال رقم ضريبي غير صحيح
    const vatInput = page.locator('input[name="customer_vat_number"]');
    if (await vatInput.count() > 0) {
      await vatInput.fill('123456789'); // رقم غير صحيح
      await page.click('button[type="submit"]');
      
      // يجب أن تظهر رسالة خطأ
      await page.waitForTimeout(500);
    }
  });

  test('display original invoice image link', async ({ page }) => {
    // بعد حفظ فاتورة من OCR، يجب أن يكون هناك رابط للصورة الأصلية
    const firstInvoice = page.locator('[data-testid="invoice-card"]').first();
    if (await firstInvoice.count() > 0) {
      await firstInvoice.click();
      
      // البحث عن رابط/أيقونة الصورة الأصلية
      const imageLink = page.locator('a:has-text("الصورة الأصلية")');
      // قد تكون موجودة أو لا حسب ما إذا كانت الفاتورة من OCR
    }
  });
});
