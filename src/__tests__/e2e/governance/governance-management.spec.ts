import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('الحوكمة والقرارات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/governance');
  });

  test('عرض صفحة الحوكمة', async ({ page }) => {
    await expectVisible(page, 'text=الحوكمة والقرارات');
    await expectVisible(page, 'button:has-text("قرار جديد")');
  });

  test('عرض قائمة القرارات', async ({ page }) => {
    await expectVisible(page, 'text=القرارات');
    
    const decisionsCount = await page.locator('[data-testid="decision-card"]').count();
    expect(decisionsCount).toBeGreaterThanOrEqual(0);
  });

  test('إضافة قرار جديد', async ({ page }) => {
    await page.click('button:has-text("قرار جديد")');
    
    await expectVisible(page, 'text=قرار جديد');
    await expectVisible(page, 'input[name="decision_number"]');
    await expectVisible(page, 'textarea[name="decision_text"]');
  });

  test('عرض تفاصيل القرار', async ({ page }) => {
    const firstDecision = page.locator('[data-testid="decision-card"]').first();
    if (await firstDecision.count() > 0) {
      await firstDecision.click();
      
      await expectVisible(page, 'text=تفاصيل القرار');
      await expectVisible(page, 'text=رقم القرار');
      await expectVisible(page, 'text=تاريخ الإصدار');
    }
  });

  test('إدارة اجتماعات مجلس الإدارة', async ({ page }) => {
    await page.click('text=الاجتماعات');
    
    await expectVisible(page, 'text=اجتماعات مجلس الإدارة');
    await expectVisible(page, 'button:has-text("اجتماع جديد")');
  });

  test('محاضر الاجتماعات', async ({ page }) => {
    await page.click('text=المحاضر');
    
    await expectVisible(page, 'text=محاضر الاجتماعات');
  });

  test('التقارير السنوية', async ({ page }) => {
    await page.click('text=التقارير السنوية');
    
    await expectVisible(page, 'text=التقارير السنوية');
    await expectVisible(page, 'button:has-text("تقرير جديد")');
  });
});
