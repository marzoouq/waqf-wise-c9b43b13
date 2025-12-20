import { test, expect, enableDarkMode, enableLightMode, waitForPageStability } from '../fixtures/visual-test.fixture';

/**
 * Role-Based Dashboard Visual Regression Tests
 * اختبارات Visual Regression للوحات التحكم حسب الدور
 */

// تعريف الأدوار والصفحات الخاصة بها
const roleConfigs = [
  {
    role: 'admin',
    name: 'المدير',
    pages: [
      { path: '/dashboard', name: 'الرئيسية' },
      { path: '/beneficiaries', name: 'المستفيدين' },
      { path: '/properties', name: 'العقارات' },
      { path: '/accounting', name: 'المحاسبة' },
      { path: '/reports', name: 'التقارير' },
      { path: '/settings', name: 'الإعدادات' },
    ],
  },
  {
    role: 'nazer',
    name: 'الناظر',
    pages: [
      { path: '/nazer-dashboard', name: 'الرئيسية' },
      { path: '/approvals', name: 'الموافقات' },
      { path: '/governance', name: 'الحوكمة' },
    ],
  },
  {
    role: 'accountant',
    name: 'المحاسب',
    pages: [
      { path: '/accountant-dashboard', name: 'الرئيسية' },
      { path: '/journal-entries', name: 'قيود اليومية' },
      { path: '/trial-balance', name: 'ميزان المراجعة' },
    ],
  },
  {
    role: 'cashier',
    name: 'أمين الصندوق',
    pages: [
      { path: '/cashier-dashboard', name: 'الرئيسية' },
      { path: '/payments', name: 'المدفوعات' },
      { path: '/receipts', name: 'الإيصالات' },
    ],
  },
];

// اختبارات لكل دور
for (const roleConfig of roleConfigs) {
  test.describe(`${roleConfig.name} (${roleConfig.role}) Dashboard Visual Tests`, () => {
    
    for (const pageConfig of roleConfig.pages) {
      test.describe(`${pageConfig.name} Page`, () => {
        
        test(`full page - light mode @visual @role @${roleConfig.role}`, async ({ page }) => {
          await page.goto(pageConfig.path);
          await waitForPageStability(page);
          await enableLightMode(page);
          
          await expect(page).toHaveScreenshot(
            `role-${roleConfig.role}-${pageConfig.name.replace(/\s/g, '-')}-light.png`,
            {
              fullPage: true,
              animations: 'disabled',
            }
          );
        });

        test(`full page - dark mode @visual @role @${roleConfig.role}`, async ({ page }) => {
          await page.goto(pageConfig.path);
          await waitForPageStability(page);
          await enableDarkMode(page);
          
          await expect(page).toHaveScreenshot(
            `role-${roleConfig.role}-${pageConfig.name.replace(/\s/g, '-')}-dark.png`,
            {
              fullPage: true,
              animations: 'disabled',
            }
          );
        });

        test(`mobile view @visual @role @responsive @${roleConfig.role}`, async ({ page }) => {
          await page.setViewportSize({ width: 375, height: 667 });
          await page.goto(pageConfig.path);
          await waitForPageStability(page);
          
          await expect(page).toHaveScreenshot(
            `role-${roleConfig.role}-${pageConfig.name.replace(/\s/g, '-')}-mobile.png`,
            {
              fullPage: true,
              animations: 'disabled',
            }
          );
        });
      });
    }
  });
}

// مقارنة القوائم الجانبية بين الأدوار
test.describe('Role Sidebar Comparison', () => {
  const dashboardPaths = [
    { role: 'admin', path: '/dashboard' },
    { role: 'nazer', path: '/nazer-dashboard' },
    { role: 'accountant', path: '/accountant-dashboard' },
  ];

  for (const config of dashboardPaths) {
    test(`${config.role} sidebar structure @visual @role @sidebar`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      
      const sidebar = page.locator('[class*="sidebar"], aside').first();
      if (await sidebar.isVisible()) {
        await expect(sidebar).toHaveScreenshot(`role-sidebar-${config.role}.png`, {
          animations: 'disabled',
        });
      }
    });

    test(`${config.role} sidebar - dark mode @visual @role @sidebar @theme`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      await enableDarkMode(page);
      
      const sidebar = page.locator('[class*="sidebar"], aside').first();
      if (await sidebar.isVisible()) {
        await expect(sidebar).toHaveScreenshot(`role-sidebar-${config.role}-dark.png`, {
          animations: 'disabled',
        });
      }
    });
  }
});

// مقارنة بطاقات الإحصائيات بين الأدوار
test.describe('Role Stats Cards Comparison', () => {
  const dashboardPaths = [
    { role: 'admin', path: '/dashboard' },
    { role: 'nazer', path: '/nazer-dashboard' },
    { role: 'accountant', path: '/accountant-dashboard' },
  ];

  for (const config of dashboardPaths) {
    test(`${config.role} stats cards - light @visual @role @cards`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      await enableLightMode(page);
      
      const statsArea = page.locator('[class*="stats"], [class*="grid"]').filter({ has: page.locator('[class*="card"]') }).first();
      if (await statsArea.isVisible()) {
        await expect(statsArea).toHaveScreenshot(`role-stats-${config.role}-light.png`, {
          animations: 'disabled',
        });
      }
    });

    test(`${config.role} stats cards - dark @visual @role @cards @theme`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      await enableDarkMode(page);
      
      const statsArea = page.locator('[class*="stats"], [class*="grid"]').filter({ has: page.locator('[class*="card"]') }).first();
      if (await statsArea.isVisible()) {
        await expect(statsArea).toHaveScreenshot(`role-stats-${config.role}-dark.png`, {
          animations: 'disabled',
        });
      }
    });
  }
});

// اختبارات خاصة ببوابة المستفيد
test.describe('Beneficiary Portal Specific Tests', () => {
  const portalTabs = [
    { tab: 'overview', name: 'نظرة عامة' },
    { tab: 'statements', name: 'كشف الحساب' },
    { tab: 'requests', name: 'الطلبات' },
    { tab: 'documents', name: 'المستندات' },
    { tab: 'profile', name: 'الملف الشخصي' },
  ];

  for (const tabConfig of portalTabs) {
    test(`portal ${tabConfig.tab} tab - light @visual @beneficiary @portal`, async ({ page }) => {
      await page.goto(`/beneficiary-portal?tab=${tabConfig.tab}`);
      await waitForPageStability(page);
      await enableLightMode(page);
      
      await expect(page).toHaveScreenshot(`portal-${tabConfig.tab}-light.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`portal ${tabConfig.tab} tab - dark @visual @beneficiary @portal @theme`, async ({ page }) => {
      await page.goto(`/beneficiary-portal?tab=${tabConfig.tab}`);
      await waitForPageStability(page);
      await enableDarkMode(page);
      
      await expect(page).toHaveScreenshot(`portal-${tabConfig.tab}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test(`portal ${tabConfig.tab} tab - mobile @visual @beneficiary @portal @responsive`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/beneficiary-portal?tab=${tabConfig.tab}`);
      await waitForPageStability(page);
      
      await expect(page).toHaveScreenshot(`portal-${tabConfig.tab}-mobile.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }

  test('portal bottom navigation - mobile @visual @beneficiary @portal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/beneficiary-portal');
    await waitForPageStability(page);
    
    const bottomNav = page.locator('[class*="bottom-nav"], [aria-label*="تنقل"]').first();
    if (await bottomNav.isVisible()) {
      // Light mode
      await enableLightMode(page);
      await expect(bottomNav).toHaveScreenshot('portal-bottom-nav-light.png', {
        animations: 'disabled',
      });
      
      // Dark mode
      await enableDarkMode(page);
      await expect(bottomNav).toHaveScreenshot('portal-bottom-nav-dark.png', {
        animations: 'disabled',
      });
    }
  });
});

// اختبارات مقارنة الهيدر بين الأدوار
test.describe('Role Header Comparison', () => {
  const dashboardPaths = [
    { role: 'admin', path: '/dashboard' },
    { role: 'nazer', path: '/nazer-dashboard' },
    { role: 'accountant', path: '/accountant-dashboard' },
    { role: 'beneficiary', path: '/beneficiary-portal' },
  ];

  for (const config of dashboardPaths) {
    test(`${config.role} header - light @visual @role @header`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      await enableLightMode(page);
      
      const header = page.locator('header, [class*="header"], [class*="topbar"]').first();
      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot(`role-header-${config.role}-light.png`, {
          animations: 'disabled',
        });
      }
    });

    test(`${config.role} header - dark @visual @role @header @theme`, async ({ page }) => {
      await page.goto(config.path);
      await waitForPageStability(page);
      await enableDarkMode(page);
      
      const header = page.locator('header, [class*="header"], [class*="topbar"]').first();
      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot(`role-header-${config.role}-dark.png`, {
          animations: 'disabled',
        });
      }
    });
  }
});
