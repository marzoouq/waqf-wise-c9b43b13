import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';
import { fillAndSubmit } from '../helpers/form-helpers';

test.describe('العمليات المحاسبية', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/accounting');
  });

  test('عرض شجرة الحسابات', async ({ page }) => {
    await expectVisible(page, 'text=شجرة الحسابات');
    await expectVisible(page, 'button:has-text("حساب جديد")');
    
    // التحقق من الحسابات الرئيسية
    await expectVisible(page, 'text=الأصول');
    await expectVisible(page, 'text=الخصوم');
    await expectVisible(page, 'text=حقوق الملكية');
    await expectVisible(page, 'text=الإيرادات');
    await expectVisible(page, 'text=المصروفات');
  });

  test('إضافة حساب جديد', async ({ page }) => {
    await page.click('button:has-text("حساب جديد")');
    
    await page.fill('input[name="code"]', '1150');
    await page.fill('input[name="name_ar"]', 'حساب اختبار جديد');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم إضافة الحساب بنجاح');
  });

  test('إنشاء قيد يومية', async ({ page }) => {
    await page.click('text=القيود اليومية');
    await page.click('button:has-text("قيد جديد")');
    
    await expectVisible(page, 'text=قيد يومية جديد');
    await expectVisible(page, 'button:has-text("إضافة سطر")');
  });

  test('عرض ميزان المراجعة', async ({ page }) => {
    await page.click('text=ميزان المراجعة');
    
    await expectVisible(page, 'text=ميزان المراجعة');
    await expectVisible(page, 'text=إجمالي المدين');
    await expectVisible(page, 'text=إجمالي الدائن');
  });

  test('عرض دفتر الأستاذ', async ({ page }) => {
    await page.click('text=دفتر الأستاذ');
    
    await expectVisible(page, 'text=دفتر الأستاذ العام');
    const accountsCount = await page.locator('[data-testid="ledger-account"]').count();
    expect(accountsCount).toBeGreaterThan(0);
  });

  test('التسوية البنكية', async ({ page }) => {
    await page.click('text=التسوية البنكية');
    
    await expectVisible(page, 'text=التسوية البنكية');
    await expectVisible(page, 'button:has-text("بدء تسوية جديدة")');
  });
});
