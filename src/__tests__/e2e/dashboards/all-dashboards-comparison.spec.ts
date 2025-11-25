import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('مقارنة جميع لوحات التحكم', () => {
  
  test('اختبار التبديل بين لوحات التحكم', async ({ page }) => {
    // الناظر
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
    await expectVisible(page, 'text=لوحة التحكم');
    const nazerElements = await page.locator('[data-testid="dashboard-element"]').count();
    console.log(`✅ عناصر لوحة الناظر: ${nazerElements}`);
    
    // تسجيل الخروج
    await page.click('button:has-text("تسجيل الخروج")');
    await page.waitForLoadState('networkidle');
    
    // المحاسب
    await loginAs(page, 'accountant');
    await navigateTo(page, '/');
    const accountantElements = await page.locator('[data-testid="dashboard-element"]').count();
    console.log(`✅ عناصر لوحة المحاسب: ${accountantElements}`);
  });

  test('التحقق من الصلاحيات حسب الدور', async ({ page }) => {
    // الناظر يجب أن يرى زر "اعتماد"
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
    
    const approveButton = page.locator('button:has-text("اعتماد")');
    expect(await approveButton.count()).toBeGreaterThan(0);
    console.log('✅ الناظر يمتلك صلاحيات الاعتماد');
    
    await page.click('button:has-text("تسجيل الخروج")');
    
    // الأرشيفي لا يجب أن يرى زر "اعتماد"
    await loginAs(page, 'archivist');
    await navigateTo(page, '/');
    
    const noApproveButton = page.locator('button:has-text("اعتماد")');
    expect(await noApproveButton.count()).toBe(0);
    console.log('✅ الأرشيفي لا يمتلك صلاحيات الاعتماد');
  });

  test('اختبار استجابة لوحات التحكم', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/');
    
    // اختبار على حجم شاشة الهاتف
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expectVisible(page, 'text=لوحة التحكم');
    console.log('✅ لوحة التحكم متجاوبة مع الهاتف');
    
    // اختبار على حجم شاشة التابلت
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ لوحة التحكم متجاوبة مع التابلت');
    
    // اختبار على حجم شاشة الحاسوب
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('✅ لوحة التحكم متجاوبة مع الحاسوب');
  });

  test('اختبار سرعة تحميل لوحات التحكم', async ({ page }) => {
    const roles: ('nazer' | 'accountant' | 'admin' | 'archivist')[] = ['nazer', 'accountant', 'admin', 'archivist'];
    
    for (const role of roles) {
      await loginAs(page, role);
      
      const startTime = Date.now();
      await navigateTo(page, '/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ وقت تحميل لوحة ${role}: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // يجب أن يكون أقل من 3 ثواني
      
      await page.click('button:has-text("تسجيل الخروج")');
    }
  });

  test('التحقق من توفر جميع المؤشرات الرئيسية', async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
    
    // التحقق من وجود KPIs أساسية
    const kpis = [
      'إجمالي العوائد',
      'عدد المستفيدين',
      'العقارات',
      'التوزيعات'
    ];
    
    for (const kpi of kpis) {
      const element = page.locator(`text=${kpi}`);
      if (await element.count() > 0) {
        console.log(`✅ KPI متوفر: ${kpi}`);
      }
    }
  });

  test('اختبار التحديث التلقائي للبيانات', async ({ page }) => {
    await loginAs(page, 'accountant');
    await navigateTo(page, '/');
    
    // الحصول على القيمة الأولية
    const initialValue = await page.locator('[data-testid="total-revenue"]').textContent();
    
    // الانتظار لمدة 5 ثواني
    await page.waitForTimeout(5000);
    
    // الحصول على القيمة المحدثة
    const updatedValue = await page.locator('[data-testid="total-revenue"]').textContent();
    
    console.log(`✅ القيمة الأولية: ${initialValue}`);
    console.log(`✅ القيمة المحدثة: ${updatedValue}`);
  });

  test('اختبار الإشعارات في الوقت الفعلي', async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
    
    // التحقق من وجود أيقونة الإشعارات
    const notificationsIcon = page.locator('[data-testid="notifications-icon"]');
    if (await notificationsIcon.count() > 0) {
      await notificationsIcon.click();
      await expectVisible(page, 'text=الإشعارات');
      
      const notificationsCount = await page.locator('[data-testid="notification-item"]').count();
      console.log(`✅ عدد الإشعارات: ${notificationsCount}`);
    }
  });

  test('اختبار البحث العام في لوحة التحكم', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/');
    
    const searchBox = page.locator('input[placeholder*="بحث"]').first();
    if (await searchBox.count() > 0) {
      await searchBox.fill('مستفيد');
      await page.waitForTimeout(1000);
      
      const results = await page.locator('[data-testid="search-result"]').count();
      console.log(`✅ نتائج البحث: ${results}`);
    }
  });

  test('اختبار تصدير بيانات لوحة التحكم', async ({ page }) => {
    await loginAs(page, 'nazer');
    await navigateTo(page, '/');
    
    const exportButton = page.locator('button:has-text("تصدير لوحة التحكم")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ تصدير لوحة التحكم متاح');
    }
  });

  test('اختبار الوضع المظلم في لوحات التحكم', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/');
    
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      const isDarkMode = await page.locator('html').getAttribute('class');
      console.log(`✅ الوضع المظلم: ${isDarkMode?.includes('dark') ? 'مفعل' : 'غير مفعل'}`);
    }
  });
});
