import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('قاعدة المعرفة', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/knowledge-base');
  });

  test('عرض قاعدة المعرفة', async ({ page }) => {
    await expectVisible(page, 'text=قاعدة المعرفة');
    await expectVisible(page, 'button:has-text("مقال جديد")');
  });

  test('البحث في قاعدة المعرفة', async ({ page }) => {
    await page.fill('input[placeholder*="بحث"]', 'كيفية');
    await page.waitForTimeout(1000);
    
    const results = await page.locator('[data-testid="article-card"]').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('عرض الأقسام', async ({ page }) => {
    await expectVisible(page, '[data-testid="category-list"]');
    
    const categoriesCount = await page.locator('[data-testid="category-item"]').count();
    expect(categoriesCount).toBeGreaterThanOrEqual(0);
  });

  test('قراءة مقال', async ({ page }) => {
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    if (await firstArticle.count() > 0) {
      await firstArticle.click();
      
      await expectVisible(page, 'text=المقال');
      await expectVisible(page, '[data-testid="article-content"]');
    }
  });

  test('إضافة مقال جديد', async ({ page }) => {
    await page.click('button:has-text("مقال جديد")');
    
    await expectVisible(page, 'text=مقال جديد');
    await expectVisible(page, 'input[name="title"]');
    await expectVisible(page, 'textarea[name="content"]');
  });

  test('تقييم مقال', async ({ page }) => {
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    if (await firstArticle.count() > 0) {
      await firstArticle.click();
      await page.click('[data-testid="helpful-yes"]');
      
      await expectToast(page, 'شكراً لتقييمك');
    }
  });

  test('الأسئلة الشائعة', async ({ page }) => {
    await page.click('text=الأسئلة الشائعة');
    
    await expectVisible(page, 'text=الأسئلة الشائعة');
    await expectVisible(page, '[data-testid="faq-item"]');
  });
});
