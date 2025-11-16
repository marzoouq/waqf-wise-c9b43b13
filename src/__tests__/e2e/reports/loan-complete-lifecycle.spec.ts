import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Loan Complete Lifecycle', () => {
  test('From request to closure', async ({ page, browser }) => {
    // 1. المستفيد يقدم طلب قرض
    await loginAs(page, 'beneficiary');
    await navigateTo(page, '/beneficiary-dashboard');
    
    await page.click('text=الطلبات');
    await page.click('button:has-text("طلب جديد")');
    await page.selectOption('[name="request_type"]', 'loan');
    await page.fill('[name="amount"]', '30000');
    await page.fill('[name="purpose"]', 'مشروع تجاري صغير');
    await page.fill('[name="repayment_months"]', '12');
    await page.fill('[name="description"]', 'محتاج قرض لبدء مشروع بقالة');
    await page.click('button:has-text("تقديم الطلب")');
    await expect(page.locator('text=تم تقديم الطلب')).toBeVisible();
    
    await logout(page);
    
    // 2. الناظر يوافق على القرض
    const nazerContext = await browser.newContext();
    const nazerPage = await nazerContext.newPage();
    
    await loginAs(nazerPage, 'nazer');
    await navigateTo(nazerPage, '/approvals');
    
    await nazerPage.click('text=موافقات القروض');
    await nazerPage.click('[data-testid="loan-request"]:first-child');
    await nazerPage.click('button:has-text("موافقة")');
    await nazerPage.fill('[name="notes"]', 'تمت الموافقة - مشروع مناسب');
    await nazerPage.click('button:has-text("تأكيد الموافقة")');
    await expect(nazerPage.locator('text=تمت الموافقة')).toBeVisible();
    
    await logout(nazerPage);
    await nazerContext.close();
    
    // 3. المحاسب يصرف القرض
    const accountantContext = await browser.newContext();
    const accountantPage = await accountantContext.newPage();
    
    await loginAs(accountantPage, 'accountant');
    await navigateTo(accountantPage, '/loans');
    
    await accountantPage.click('[data-testid="approved-loan"]:first-child');
    await accountantPage.click('button:has-text("صرف القرض")');
    await accountantPage.fill('[name="disbursement_date"]', '2025-01-15');
    await accountantPage.selectOption('[name="payment_method"]', 'bank_transfer');
    await accountantPage.fill('[name="reference_number"]', 'LOAN-20250115');
    await accountantPage.click('button:has-text("تأكيد الصرف")');
    await expect(accountantPage.locator('text=تم صرف القرض')).toBeVisible();
    
    // 4. التحقق من جدول الأقساط
    await accountantPage.click('button:has-text("جدول الأقساط")');
    await expect(accountantPage.locator('[data-testid="installment-schedule"]')).toBeVisible();
    await expect(accountantPage.locator('[data-testid="installment-row"]')).toHaveCount(12);
    
    // التحقق من القيود المحاسبية
    await navigateTo(accountantPage, '/accounting');
    await accountantPage.click('text=القيود اليومية');
    await expect(accountantPage.locator('text=قرض رقم')).toBeVisible();
    
    await logout(accountantPage);
    await accountantContext.close();
    
    // 5. المستفيد يسدد قسط أول
    await loginAs(page, 'beneficiary');
    await navigateTo(page, '/beneficiary-dashboard');
    
    await page.click('text=قروضي');
    await page.click('[data-testid="active-loan"]:first-child');
    await expect(page.locator('[data-testid="loan-details"]')).toBeVisible();
    await expect(page.locator('text=30,000')).toBeVisible();
    await expect(page.locator('text=12 قسط')).toBeVisible();
    
    await logout(page);
    
    // 6. المحاسب يسجل السداد
    const accountant2Context = await browser.newContext();
    const accountant2Page = await accountant2Context.newPage();
    
    await loginAs(accountant2Page, 'accountant');
    await navigateTo(accountant2Page, '/loans');
    
    await accountant2Page.click('[data-testid="active-loan"]:first-child');
    await accountant2Page.click('button:has-text("تسجيل سداد")');
    await accountant2Page.fill('[name="payment_date"]', '2025-02-15');
    await accountant2Page.fill('[name="amount"]', '2500');
    await accountant2Page.selectOption('[name="payment_method"]', 'bank_transfer');
    await accountant2Page.click('button:has-text("تأكيد السداد")');
    await expect(accountant2Page.locator('text=تم تسجيل السداد')).toBeVisible();
    
    // 7. التحقق من تحديث جدول الأقساط
    await accountant2Page.click('button:has-text("جدول الأقساط")');
    const firstInstallment = accountant2Page.locator('[data-testid="installment-row"]:first-child');
    await expect(firstInstallment.locator('[data-testid="status"]')).toHaveText('paid');
    
    // 8. التحقق من القيود المحاسبية للسداد
    await navigateTo(accountant2Page, '/accounting');
    await accountant2Page.click('text=القيود اليومية');
    await expect(accountant2Page.locator('text=سداد قسط')).toBeVisible();
    
    await logout(accountant2Page);
    await accountant2Context.close();
  });
});
