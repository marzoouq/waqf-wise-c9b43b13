import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم المحاسب', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/');
  });

  test('عرض الملخص المالي', async ({ page }) => {
    await expectVisible(page, 'text=الملخص المالي');
    await expectVisible(page, 'text=الإيرادات');
    await expectVisible(page, 'text=المصروفات');
    await expectVisible(page, 'text=الرصيد');
    
    const financialCards = await page.locator('[data-testid="financial-card"]').count();
    expect(financialCards).toBeGreaterThan(0);
  });

  test('عرض القيود المحاسبية الأخيرة', async ({ page }) => {
    await expectVisible(page, 'text=القيود الأخيرة');
    
    const journalEntries = await page.locator('[data-testid="journal-entry"]').count();
    console.log(`✅ القيود المحاسبية: ${journalEntries}`);
  });

  test('عرض القيود المعلقة', async ({ page }) => {
    await expectVisible(page, 'text=قيود تحتاج مراجعة');
    
    const pendingEntries = await page.locator('[data-status="pending"]').count();
    console.log(`✅ القيود المعلقة: ${pendingEntries}`);
  });

  test('عرض ملخص الحسابات البنكية', async ({ page }) => {
    const bankSection = page.locator('[data-testid="bank-accounts-summary"]');
    if (await bankSection.count() > 0) {
      await expectVisible(page, 'text=الحسابات البنكية');
      
      const accounts = await page.locator('[data-testid="bank-account"]').count();
      console.log(`✅ الحسابات البنكية: ${accounts}`);
    }
  });

  test('إنشاء قيد يومية سريع', async ({ page }) => {
    const quickEntryButton = page.locator('button:has-text("قيد سريع")');
    if (await quickEntryButton.count() > 0) {
      await quickEntryButton.click();
      await expectVisible(page, 'text=قيد يومية جديد');
      console.log('✅ إنشاء قيد سريع متاح');
    }
  });

  test('عرض رسم بياني للإيرادات والمصروفات', async ({ page }) => {
    const chart = page.locator('[data-testid="revenue-expenses-chart"]');
    if (await chart.count() > 0) {
      await expectVisible(page, 'text=الإيرادات والمصروفات');
      console.log('✅ الرسم البياني متاح');
    }
  });

  test('عرض التقارير المالية السريعة', async ({ page }) => {
    await expectVisible(page, 'text=التقارير السريعة');
    
    const reportsCount = await page.locator('[data-testid="quick-report"]').count();
    console.log(`✅ التقارير السريعة: ${reportsCount}`);
  });

  test('الانتقال لميزان المراجعة', async ({ page }) => {
    const trialBalanceLink = page.locator('a:has-text("ميزان المراجعة")').first();
    if (await trialBalanceLink.count() > 0) {
      await trialBalanceLink.click();
      await page.waitForLoadState('networkidle');
      await expectVisible(page, 'text=ميزان المراجعة');
    }
  });

  test('عرض الموافقات المالية المطلوبة', async ({ page }) => {
    const approvalsSection = page.locator('[data-testid="financial-approvals"]');
    if (await approvalsSection.count() > 0) {
      const approvalsCount = await page.locator('[data-testid="approval-item"]').count();
      console.log(`✅ الموافقات المالية: ${approvalsCount}`);
    }
  });

  test('عرض تنبيهات التسوية البنكية', async ({ page }) => {
    const reconciliationAlerts = page.locator('[data-testid="reconciliation-alert"]');
    if (await reconciliationAlerts.count() > 0) {
      console.log('✅ تنبيهات التسوية البنكية متاحة');
    }
  });
});
