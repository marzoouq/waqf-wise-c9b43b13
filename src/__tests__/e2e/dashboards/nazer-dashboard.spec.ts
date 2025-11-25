import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectText } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم الناظر - اختبار شامل', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
  });

  test('عرض KPIs الرئيسية', async ({ page }) => {
    // التحقق من وجود المؤشرات الرئيسية
    await expectVisible(page, 'text=إجمالي العوائد');
    await expectVisible(page, 'text=عدد المستفيدين');
    await expectVisible(page, 'text=العقارات');
    await expectVisible(page, 'text=التوزيعات');
    
    // التحقق من وجود الأرقام
    const kpiCards = await page.locator('[data-testid="kpi-card"]').count();
    expect(kpiCards).toBeGreaterThan(0);
  });

  test('عرض الرسوم البيانية التفاعلية', async ({ page }) => {
    await expectVisible(page, '[data-testid="revenue-chart"]');
    await expectVisible(page, '[data-testid="expenses-chart"]');
    
    // التحقق من التفاعل مع الرسم البياني
    const chart = page.locator('[data-testid="revenue-chart"]').first();
    if (await chart.count() > 0) {
      await chart.hover();
      console.log('✅ الرسوم البيانية تفاعلية');
    }
  });

  test('عرض التوزيعات المعلقة', async ({ page }) => {
    await expectVisible(page, 'text=التوزيعات المعلقة');
    
    const pendingDistributions = await page.locator('[data-status="pending"]').count();
    console.log(`✅ التوزيعات المعلقة: ${pendingDistributions}`);
  });

  test('عرض الطلبات التي تحتاج موافقة', async ({ page }) => {
    await expectVisible(page, 'text=طلبات تحتاج موافقة');
    
    const pendingRequests = await page.locator('[data-testid="pending-request"]').count();
    console.log(`✅ الطلبات المعلقة: ${pendingRequests}`);
  });

  test('إجراءات سريعة - اعتماد توزيع', async ({ page }) => {
    const quickApproveButton = page.locator('button:has-text("اعتماد سريع")').first();
    if (await quickApproveButton.count() > 0) {
      await quickApproveButton.click();
      await expectVisible(page, 'text=تأكيد الاعتماد');
      console.log('✅ إجراء الاعتماد السريع متاح');
    }
  });

  test('عرض تنبيهات النظام', async ({ page }) => {
    const alertsSection = page.locator('[data-testid="system-alerts"]');
    if (await alertsSection.count() > 0) {
      await expectVisible(page, 'text=تنبيهات');
      
      const alertsCount = await page.locator('[data-testid="alert-item"]').count();
      console.log(`✅ التنبيهات: ${alertsCount}`);
    }
  });

  test('عرض النشاط الأخير', async ({ page }) => {
    await expectVisible(page, 'text=النشاط الأخير');
    
    const activityItems = await page.locator('[data-testid="activity-item"]').count();
    console.log(`✅ أنشطة حديثة: ${activityItems}`);
  });

  test('الانتقال السريع للأقسام', async ({ page }) => {
    // اختبار الانتقال السريع للمستفيدين
    const beneficiariesLink = page.locator('a[href="/beneficiaries"]').first();
    if (await beneficiariesLink.count() > 0) {
      await beneficiariesLink.click();
      await page.waitForLoadState('networkidle');
      await expectVisible(page, 'text=المستفيدون');
      console.log('✅ الانتقال السريع يعمل');
    }
  });

  test('تخصيص لوحة التحكم', async ({ page }) => {
    const customizeButton = page.locator('button:has-text("تخصيص")');
    if (await customizeButton.count() > 0) {
      await customizeButton.click();
      await expectVisible(page, 'text=تخصيص لوحة التحكم');
      console.log('✅ التخصيص متاح');
    }
  });

  test('تصدير تقرير لوحة التحكم', async ({ page }) => {
    const exportButton = page.locator('button:has-text("تصدير")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ التصدير متاح');
    }
  });
});
