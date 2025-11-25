import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('الرؤى الذكية والتحليلات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/smart-insights');
  });

  test('عرض لوحة الرؤى الذكية', async ({ page }) => {
    await expectVisible(page, 'text=الرؤى الذكية');
    await expectVisible(page, '[data-testid="insight-card"]');
  });

  test('تحليل اتجاهات المستفيدين', async ({ page }) => {
    await page.click('text=اتجاهات المستفيدين');
    
    await expectVisible(page, 'text=تحليل اتجاهات المستفيدين');
    await expectVisible(page, '[data-testid="trend-chart"]');
  });

  test('توقع احتياجات المستفيدين', async ({ page }) => {
    await page.click('text=التوقعات الذكية');
    
    await expectVisible(page, 'text=توقعات احتياجات المستفيدين');
    await expectVisible(page, 'text=التوقع للربع القادم');
  });

  test('تحليل أداء العقارات', async ({ page }) => {
    await page.click('text=أداء العقارات');
    
    await expectVisible(page, 'text=تحليل أداء العقارات');
    await expectVisible(page, 'text=عوائد الاستثمار');
  });

  test('تحليل كفاءة التوزيعات', async ({ page }) => {
    await page.click('text=كفاءة التوزيعات');
    
    await expectVisible(page, 'text=تحليل كفاءة التوزيعات');
    await expectVisible(page, 'text=متوسط وقت التنفيذ');
  });

  test('التنبيهات الذكية', async ({ page }) => {
    await expectVisible(page, '[data-testid="smart-alert"]');
    
    const alertsCount = await page.locator('[data-testid="smart-alert"]').count();
    expect(alertsCount).toBeGreaterThanOrEqual(0);
  });

  test('توصيات النظام', async ({ page }) => {
    await expectVisible(page, '[data-testid="system-recommendation"]');
    
    const recommendationsCount = await page.locator('[data-testid="system-recommendation"]').count();
    expect(recommendationsCount).toBeGreaterThanOrEqual(0);
  });
});
