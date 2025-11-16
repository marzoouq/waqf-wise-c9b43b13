import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Multi-Step Approval Process', () => {
  test('Complete distribution approval workflow', async ({ browser }) => {
    // 1. المحاسب ينشئ توزيع 1,000,000 ريال
    const accountantContext = await browser.newContext();
    const accountantPage = await accountantContext.newPage();
    
    await loginAs(accountantPage, 'accountant');
    await navigateTo(accountantPage, '/funds');
    
    await accountantPage.click('button:has-text("توزيع جديد")');
    await accountantPage.fill('[name="distribution_date"]', '2025-01-15');
    await accountantPage.fill('[name="month"]', '2025-01');
    await accountantPage.fill('[name="total_amount"]', '1000000');
    await accountantPage.fill('[name="notes"]', 'توزيع غلة يناير 2025');
    
    // محاكاة التوزيع
    await accountantPage.click('button:has-text("محاكاة")');
    await expect(accountantPage.locator('[data-testid="simulation-results"]')).toBeVisible();
    await expect(accountantPage.locator('[data-testid="beneficiaries-count"]')).toContainText(/\d+/);
    
    // حفظ التوزيع
    await accountantPage.click('button:has-text("حفظ التوزيع")');
    await expect(accountantPage.locator('text=تم إنشاء التوزيع')).toBeVisible();
    
    // إرسال للموافقة
    await accountantPage.click('button:has-text("إرسال للموافقة")');
    await expect(accountantPage.locator('text=تم إرسال التوزيع للموافقة')).toBeVisible();
    
    const distributionId = await accountantPage.locator('[data-testid="distribution-id"]').textContent();
    
    await logout(accountantPage);
    await accountantContext.close();
    
    // 2. الناظر يراجع ويوافق
    const nazerContext = await browser.newContext();
    const nazerPage = await nazerContext.newPage();
    
    await loginAs(nazerPage, 'nazer');
    await navigateTo(nazerPage, '/approvals');
    
    // عرض موافقات التوزيعات المعلقة
    await nazerPage.click('text=موافقات التوزيعات');
    await expect(nazerPage.locator('[data-testid="pending-distribution"]').first()).toBeVisible();
    
    // فتح التوزيع للمراجعة
    await nazerPage.click('[data-testid="pending-distribution"]:first-child');
    
    // مراجعة التفاصيل
    await expect(nazerPage.locator('text=1,000,000')).toBeVisible();
    await expect(nazerPage.locator('[data-testid="distribution-details"]')).toBeVisible();
    
    // عرض قائمة المستفيدين
    await nazerPage.click('button:has-text("قائمة المستفيدين")');
    await expect(nazerPage.locator('[data-testid="beneficiaries-list"]')).toBeVisible();
    
    // الموافقة على التوزيع
    await nazerPage.click('button:has-text("موافقة")');
    await nazerPage.fill('[name="approval_notes"]', 'تمت الموافقة - التوزيع مطابق للشروط');
    await nazerPage.click('button:has-text("تأكيد الموافقة")');
    await expect(nazerPage.locator('text=تمت الموافقة على التوزيع')).toBeVisible();
    
    await logout(nazerPage);
    await nazerContext.close();
    
    // 3. أمين الصندوق ينفذ الصرف
    const cashierContext = await browser.newContext();
    const cashierPage = await cashierContext.newPage();
    
    await loginAs(cashierPage, 'cashier');
    await navigateTo(cashierPage, '/payments');
    
    // عرض التوزيعات الموافق عليها
    await cashierPage.click('text=توزيعات معتمدة');
    await expect(cashierPage.locator('[data-testid="approved-distribution"]').first()).toBeVisible();
    
    // فتح التوزيع
    await cashierPage.click('[data-testid="approved-distribution"]:first-child');
    
    // تنفيذ الصرف
    await cashierPage.click('button:has-text("تنفيذ الصرف")');
    await cashierPage.selectOption('[name="payment_method"]', 'bank_transfer');
    await cashierPage.fill('[name="execution_date"]', '2025-01-16');
    await cashierPage.fill('[name="reference_batch"]', 'BATCH-20250116');
    await cashierPage.click('button:has-text("تأكيد التنفيذ")');
    await expect(cashierPage.locator('text=تم تنفيذ الصرف')).toBeVisible();
    
    await logout(cashierPage);
    await cashierContext.close();
    
    // 4. التحقق من القيود المحاسبية
    const verifyContext = await browser.newContext();
    const verifyPage = await verifyContext.newPage();
    
    await loginAs(verifyPage, 'accountant');
    await navigateTo(verifyPage, '/accounting');
    
    await verifyPage.click('text=القيود اليومية');
    
    // البحث عن القيد المتعلق بالتوزيع
    await expect(verifyPage.locator('text=توزيع غلة')).toBeVisible();
    await expect(verifyPage.locator('text=1,000,000')).toBeVisible();
    
    // فتح القيد للتحقق
    await verifyPage.click('[data-testid="journal-entry"]:has-text("توزيع غلة")');
    await expect(verifyPage.locator('[data-testid="debit-total"]')).toHaveText('1,000,000.00');
    await expect(verifyPage.locator('[data-testid="credit-total"]')).toHaveText('1,000,000.00');
    await expect(verifyPage.locator('[data-testid="balanced-indicator"]')).toBeVisible();
    
    await logout(verifyPage);
    await verifyContext.close();
    
    // 5. التحقق من إشعارات المستفيدين
    const beneficiaryContext = await browser.newContext();
    const beneficiaryPage = await beneficiaryContext.newPage();
    
    await loginAs(beneficiaryPage, 'beneficiary');
    await navigateTo(beneficiaryPage, '/beneficiary-dashboard');
    
    // التحقق من وجود إشعار
    await expect(beneficiaryPage.locator('[data-testid="notifications-bell"]')).toHaveAttribute('data-has-new', 'true');
    
    await beneficiaryPage.click('[data-testid="notifications-bell"]');
    await expect(beneficiaryPage.locator('text=تم صرف مستحقاتك')).toBeVisible();
    
    // عرض تفاصيل الدفعة
    await beneficiaryPage.click('text=المدفوعات');
    await expect(beneficiaryPage.locator('[data-testid="recent-payment"]').first()).toBeVisible();
    
    await logout(beneficiaryPage);
    await beneficiaryContext.close();
  });
  
  test('Rejection workflow', async ({ browser }) => {
    // المحاسب ينشئ توزيع
    const accountantContext = await browser.newContext();
    const accountantPage = await accountantContext.newPage();
    
    await loginAs(accountantPage, 'accountant');
    await navigateTo(accountantPage, '/funds');
    
    await accountantPage.click('button:has-text("توزيع جديد")');
    await accountantPage.fill('[name="total_amount"]', '500000');
    await accountantPage.click('button:has-text("حفظ التوزيع")');
    await accountantPage.click('button:has-text("إرسال للموافقة")');
    
    await logout(accountantPage);
    await accountantContext.close();
    
    // الناظر يرفض التوزيع
    const nazerContext = await browser.newContext();
    const nazerPage = await nazerContext.newPage();
    
    await loginAs(nazerPage, 'nazer');
    await navigateTo(nazerPage, '/approvals');
    
    await nazerPage.click('text=موافقات التوزيعات');
    await nazerPage.click('[data-testid="pending-distribution"]:first-child');
    
    // رفض التوزيع
    await nazerPage.click('button:has-text("رفض")');
    await nazerPage.fill('[name="rejection_reason"]', 'المبلغ غير مطابق للرصيد المتاح');
    await nazerPage.click('button:has-text("تأكيد الرفض")');
    await expect(nazerPage.locator('text=تم رفض التوزيع')).toBeVisible();
    
    await logout(nazerPage);
    await nazerContext.close();
    
    // المحاسب يستلم إشعار الرفض
    const accountant2Context = await browser.newContext();
    const accountant2Page = await accountant2Context.newPage();
    
    await loginAs(accountant2Page, 'accountant');
    await navigateTo(accountant2Page, '/funds');
    
    await expect(accountant2Page.locator('[data-testid="rejected-distribution"]').first()).toBeVisible();
    await accountant2Page.click('[data-testid="rejected-distribution"]:first-child');
    await expect(accountant2Page.locator('text=المبلغ غير مطابق للرصيد المتاح')).toBeVisible();
    
    await logout(accountant2Page);
    await accountant2Context.close();
  });
});
