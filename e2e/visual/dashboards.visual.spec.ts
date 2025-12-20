import { test, expect, enableDarkMode, enableLightMode, waitForPageStability } from '../fixtures/visual-test.fixture';

/**
 * Dashboards Visual Regression Tests
 * اختبارات Visual Regression للوحات التحكم المختلفة
 */

// لوحات التحكم المختلفة حسب الدور
const dashboards = [
  { name: 'admin', path: '/dashboard', title: 'لوحة تحكم المدير' },
  { name: 'nazer', path: '/nazer-dashboard', title: 'لوحة تحكم الناظر' },
  { name: 'accountant', path: '/accountant-dashboard', title: 'لوحة تحكم المحاسب' },
  { name: 'beneficiary-portal', path: '/beneficiary-portal', title: 'بوابة المستفيد' },
];

test.describe('Admin Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageStability(page);
  });

  test('full dashboard layout @visual @dashboard', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-admin-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('sidebar navigation @visual @dashboard', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside, nav').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('dashboard-admin-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('header section @visual @dashboard', async ({ page }) => {
    const header = page.locator('header, [class*="header"]').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('dashboard-admin-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('stats cards @visual @dashboard', async ({ page }) => {
    const statsSection = page.locator('[class*="stats"], [class*="card"]').first();
    if (await statsSection.isVisible()) {
      await expect(statsSection).toHaveScreenshot('dashboard-admin-stats.png', {
        animations: 'disabled',
      });
    }
  });

  test('charts section @visual @dashboard', async ({ page }) => {
    const charts = page.locator('[class*="chart"], [class*="Chart"], canvas, svg').first();
    if (await charts.isVisible()) {
      await charts.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000); // انتظار رسم الرسوم البيانية
      await expect(charts).toHaveScreenshot('dashboard-admin-charts.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Nazer Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nazer-dashboard');
    await waitForPageStability(page);
  });

  test('full nazer dashboard @visual @dashboard', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-nazer-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('nazer sidebar @visual @dashboard', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside, nav').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('dashboard-nazer-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('nazer stats overview @visual @dashboard', async ({ page }) => {
    const overview = page.locator('[class*="overview"], [class*="stats"]').first();
    if (await overview.isVisible()) {
      await expect(overview).toHaveScreenshot('dashboard-nazer-overview.png', {
        animations: 'disabled',
      });
    }
  });

  test('nazer approvals section @visual @dashboard', async ({ page }) => {
    const approvals = page.locator('[class*="approval"], [class*="pending"]').first();
    if (await approvals.isVisible()) {
      await expect(approvals).toHaveScreenshot('dashboard-nazer-approvals.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Accountant Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accountant-dashboard');
    await waitForPageStability(page);
  });

  test('full accountant dashboard @visual @dashboard', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-accountant-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('accountant sidebar @visual @dashboard', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside, nav').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('dashboard-accountant-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('financial summary @visual @dashboard', async ({ page }) => {
    const summary = page.locator('[class*="summary"], [class*="financial"]').first();
    if (await summary.isVisible()) {
      await expect(summary).toHaveScreenshot('dashboard-accountant-summary.png', {
        animations: 'disabled',
      });
    }
  });

  test('journal entries section @visual @dashboard', async ({ page }) => {
    const journal = page.locator('[class*="journal"], [class*="entries"]').first();
    if (await journal.isVisible()) {
      await expect(journal).toHaveScreenshot('dashboard-accountant-journal.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Beneficiary Portal Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/beneficiary-portal');
    await waitForPageStability(page);
  });

  test('full beneficiary portal @visual @dashboard', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-beneficiary-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('beneficiary navigation @visual @dashboard', async ({ page }) => {
    const nav = page.locator('[class*="nav"], [class*="sidebar"], aside').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('dashboard-beneficiary-nav.png', {
        animations: 'disabled',
      });
    }
  });

  test('beneficiary overview section @visual @dashboard', async ({ page }) => {
    const overview = page.locator('[class*="overview"], main section').first();
    if (await overview.isVisible()) {
      await expect(overview).toHaveScreenshot('dashboard-beneficiary-overview.png', {
        animations: 'disabled',
      });
    }
  });

  test('beneficiary mobile bottom nav @visual @dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const bottomNav = page.locator('[class*="bottom"], [aria-label*="تنقل"]').first();
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toHaveScreenshot('dashboard-beneficiary-bottom-nav.png', {
        animations: 'disabled',
      });
    }
  });
});

// اختبارات مقارنة الثيمات للوحات التحكم
test.describe('Dashboard Theme Comparison Tests', () => {
  
  for (const dashboard of dashboards) {
    test.describe(`${dashboard.name} Theme Comparison`, () => {
      
      test(`${dashboard.name} - light mode @visual @dashboard @theme`, async ({ page }) => {
        await page.goto(dashboard.path);
        await waitForPageStability(page);
        await enableLightMode(page);
        
        await expect(page).toHaveScreenshot(`dashboard-${dashboard.name}-light.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });

      test(`${dashboard.name} - dark mode @visual @dashboard @theme`, async ({ page }) => {
        await page.goto(dashboard.path);
        await waitForPageStability(page);
        await enableDarkMode(page);
        
        await expect(page).toHaveScreenshot(`dashboard-${dashboard.name}-dark.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });

      test(`${dashboard.name} - sidebar light vs dark @visual @dashboard @theme`, async ({ page }) => {
        await page.goto(dashboard.path);
        await waitForPageStability(page);
        
        const sidebar = page.locator('[class*="sidebar"], aside, nav').first();
        if (await sidebar.isVisible()) {
          // Light mode
          await enableLightMode(page);
          await expect(sidebar).toHaveScreenshot(`dashboard-${dashboard.name}-sidebar-light.png`, {
            animations: 'disabled',
          });
          
          // Dark mode
          await enableDarkMode(page);
          await expect(sidebar).toHaveScreenshot(`dashboard-${dashboard.name}-sidebar-dark.png`, {
            animations: 'disabled',
          });
        }
      });

      test(`${dashboard.name} - cards light vs dark @visual @dashboard @theme`, async ({ page }) => {
        await page.goto(dashboard.path);
        await waitForPageStability(page);
        
        const cards = page.locator('[class*="card"], [class*="Card"]').first();
        if (await cards.isVisible()) {
          // Light mode
          await enableLightMode(page);
          await expect(cards).toHaveScreenshot(`dashboard-${dashboard.name}-cards-light.png`, {
            animations: 'disabled',
          });
          
          // Dark mode
          await enableDarkMode(page);
          await expect(cards).toHaveScreenshot(`dashboard-${dashboard.name}-cards-dark.png`, {
            animations: 'disabled',
          });
        }
      });
    });
  }
});

// اختبارات Responsive للوحات التحكم
test.describe('Dashboard Responsive Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const dashboard of dashboards) {
    for (const viewport of viewports) {
      test(`${dashboard.name} - ${viewport.name} @visual @dashboard @responsive`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(dashboard.path);
        await waitForPageStability(page);
        
        await expect(page).toHaveScreenshot(
          `dashboard-${dashboard.name}-${viewport.name}.png`,
          {
            fullPage: true,
            animations: 'disabled',
          }
        );
      });
    }
  }
});

// اختبارات التفاعل مع القائمة الجانبية
test.describe('Dashboard Sidebar Interaction Tests', () => {
  
  test('admin sidebar collapse/expand @visual @dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageStability(page);
    
    // البحث عن زر طي القائمة
    const collapseBtn = page.locator('[aria-label*="collapse"], [aria-label*="طي"], button:has([class*="chevron"])').first();
    
    if (await collapseBtn.isVisible()) {
      // الحالة الموسعة
      await expect(page).toHaveScreenshot('dashboard-sidebar-expanded.png', {
        animations: 'disabled',
      });
      
      // النقر للطي
      await collapseBtn.click();
      await page.waitForTimeout(500);
      
      // الحالة المطوية
      await expect(page).toHaveScreenshot('dashboard-sidebar-collapsed.png', {
        animations: 'disabled',
      });
    }
  });

  test('mobile sidebar drawer @visual @dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await waitForPageStability(page);
    
    // البحث عن زر فتح القائمة
    const menuBtn = page.locator('[aria-label*="menu"], [aria-label*="قائمة"]').first();
    
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('dashboard-mobile-drawer-open.png', {
        animations: 'disabled',
      });
    }
  });
});
