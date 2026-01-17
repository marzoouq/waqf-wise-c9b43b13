/**
 * Visual Regression Tests - Pages
 * اختبارات الانحدار البصري للصفحات الرئيسية
 * @version 2.8.91
 */

import { test, expect } from '@playwright/test';

// الصفحات الرئيسية للاختبار
const mainPages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'beneficiaries', path: '/beneficiaries' },
  { name: 'properties', path: '/properties' },
  { name: 'accounting', path: '/accounting' },
  { name: 'reports', path: '/reports' },
];

// لوحات التحكم
const dashboards = [
  { name: 'admin-dashboard', path: '/admin-dashboard' },
  { name: 'nazer-dashboard', path: '/nazer-dashboard' },
  { name: 'accountant-dashboard', path: '/accountant-dashboard' },
  { name: 'cashier-dashboard', path: '/cashier-dashboard' },
];

test.describe('Visual Regression - Main Pages @visual', () => {
  for (const page of mainPages) {
    test(`${page.name} page should match snapshot`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');
      
      // انتظار تحميل الخطوط
      await browserPage.waitForFunction(() => document.fonts.ready);
      
      // إخفاء العناصر الديناميكية
      await browserPage.addStyleTag({
        content: `
          [data-testid="timestamp"], 
          [data-testid="realtime"],
          .animate-pulse { 
            visibility: hidden !important; 
          }
        `
      });
      
      await expect(browserPage).toHaveScreenshot(`${page.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Dashboards @visual @dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول قبل الوصول للوحات التحكم
    // يمكن استخدام mock auth أو تخطي هذا في البيئة المحلية
  });

  for (const dashboard of dashboards) {
    test(`${dashboard.name} should match snapshot`, async ({ page }) => {
      await page.goto(dashboard.path);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`${dashboard.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Components @visual', () => {
  test('buttons should match snapshot', async ({ page }) => {
    await page.goto('/');
    
    // التقاط صورة للأزرار
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      await expect(buttons).toHaveScreenshot('button-default.png');
    }
  });

  test('cards should match snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('[data-testid="kpi-card"]').first();
    if (await card.isVisible()) {
      await expect(card).toHaveScreenshot('kpi-card.png');
    }
  });

  test('tables should match snapshot', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      await expect(table).toHaveScreenshot('data-table.png');
    }
  });
});

test.describe('Visual Regression - Empty States @visual', () => {
  test('empty state should match snapshot', async ({ page }) => {
    await page.goto('/beneficiaries?filter=nonexistent');
    await page.waitForLoadState('networkidle');
    
    const emptyState = page.locator('[data-testid="empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toHaveScreenshot('empty-state.png');
    }
  });
});

test.describe('Visual Regression - Loading States @visual', () => {
  test('skeleton loading should match snapshot', async ({ page }) => {
    // اعتراض الطلبات لإبقاء حالة التحميل
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.continue();
    });
    
    await page.goto('/dashboard');
    
    const skeleton = page.locator('.animate-pulse').first();
    if (await skeleton.isVisible()) {
      await expect(skeleton).toHaveScreenshot('skeleton-loading.png');
    }
  });
});
