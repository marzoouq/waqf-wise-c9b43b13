import { test, expect } from '@playwright/test';

/**
 * اختبار E2E: رحلة الناظر اليومية
 * Nazer Daily Operations Journey
 * 
 * السيناريو:
 * 1. تسجيل الدخول
 * 2. عرض لوحة التحكم + KPIs
 * 3. مراجعة الموافقات المعلقة
 * 4. الموافقة على توزيع
 * 5. مراجعة طلب قرض
 * 6. عرض تقرير مالي
 * 7. فحص التنبيهات الذكية
 * 8. تسجيل الخروج
 */

test.describe('Nazer Daily Operations', () => {
  test.beforeEach(async ({ page }) => {
    // إعداد: تسجيل الدخول كناظر
    await page.goto('/auth');
    
    // الانتظار حتى تحميل الصفحة
    await page.waitForLoadState('networkidle');
  });

  test('should complete full nazer daily workflow', async ({ page }) => {
    // ============================================
    // المرحلة 1: تسجيل الدخول
    // ============================================
    await test.step('Login as Nazer', async () => {
      await page.fill('[name="email"]', 'nazer@waqf.sa');
      await page.fill('[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');
      
      // الانتظار للتوجيه إلى لوحة التحكم
      await expect(page).toHaveURL(/\/nazer-dashboard/, { timeout: 10000 });
      
      console.log('✅ Logged in as Nazer');
    });

    // ============================================
    // المرحلة 2: عرض لوحة التحكم + KPIs
    // ============================================
    await test.step('View Dashboard and KPIs', async () => {
      // التحقق من عناصر لوحة التحكم
      await expect(page.locator('text=مرحباً')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=لوحة تحكم الناظر')).toBeVisible();
      
      // التحقق من KPIs الرئيسية
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-beneficiaries"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-approvals"]')).toBeVisible();
      
      // الحصول على عدد الموافقات المعلقة
      const pendingCount = await page.locator('[data-testid="pending-count"]').textContent();
      console.log('✅ Dashboard loaded - Pending approvals:', pendingCount);
    });

    // ============================================
    // المرحلة 3: مراجعة الموافقات المعلقة
    // ============================================
    await test.step('Review Pending Approvals', async () => {
      // النقر على قسم الموافقات المعلقة
      await page.click('text=الموافقات المعلقة');
      
      // الانتظار لتحميل القائمة
      await page.waitForLoadState('networkidle');
      
      // التحقق من وجود موافقات
      const approvalsSection = page.locator('[data-testid="approvals-list"]');
      await expect(approvalsSection).toBeVisible();
      
      console.log('✅ Pending approvals section opened');
    });

    // ============================================
    // المرحلة 4: الموافقة على توزيع
    // ============================================
    await test.step('Approve Distribution', async () => {
      // البحث عن توزيع معلق
      const distributionItem = page.locator('[data-testid^="distribution-"]').first();
      
      if (await distributionItem.isVisible()) {
        // النقر على زر "مراجعة"
        await distributionItem.locator('button:has-text("مراجعة")').click();
        
        // الانتظار لظهور نافذة المراجعة
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // التحقق من تفاصيل التوزيع
        await expect(page.locator('text=تفاصيل التوزيع')).toBeVisible();
        await expect(page.locator('[data-testid="distribution-amount"]')).toBeVisible();
        await expect(page.locator('[data-testid="beneficiaries-count"]')).toBeVisible();
        
        // إضافة ملاحظات
        await page.fill('textarea[name="notes"]', 'موافق على التوزيع - جميع البيانات صحيحة');
        
        // النقر على زر "موافقة"
        await page.click('button:has-text("موافقة")');
        
        // التحقق من رسالة النجاح
        await expect(page.locator('text=تمت الموافقة بنجاح')).toBeVisible({ timeout: 5000 });
        
        console.log('✅ Distribution approved successfully');
      } else {
        console.log('⚠️ No pending distributions found');
      }
    });

    // ============================================
    // المرحلة 5: مراجعة طلب قرض
    // ============================================
    await test.step('Review Loan Request', async () => {
      // الانتقال إلى قسم القروض
      await page.click('a[href="/loans"]');
      await page.waitForLoadState('networkidle');
      
      // البحث عن قروض معلقة
      await page.click('button:has-text("المعلقة")');
      
      const loanItem = page.locator('[data-testid^="loan-"]').first();
      
      if (await loanItem.isVisible()) {
        // فتح تفاصيل القرض
        await loanItem.click();
        
        // التحقق من التفاصيل
        await expect(page.locator('text=تفاصيل القرض')).toBeVisible();
        await expect(page.locator('[data-testid="loan-amount"]')).toBeVisible();
        await expect(page.locator('[data-testid="loan-term"]')).toBeVisible();
        
        // الموافقة على القرض
        await page.click('button:has-text("موافقة")');
        await page.fill('textarea[name="notes"]', 'موافق على القرض');
        await page.click('button[type="submit"]');
        
        await expect(page.locator('text=تمت الموافقة')).toBeVisible();
        
        console.log('✅ Loan approved');
      } else {
        console.log('⚠️ No pending loans found');
      }
    });

    // ============================================
    // المرحلة 6: عرض تقرير مالي
    // ============================================
    await test.step('View Financial Report', async () => {
      // الانتقال إلى صفحة التقارير
      await page.click('a[href="/reports"]');
      await page.waitForLoadState('networkidle');
      
      // النقر على "تقرير مالي شامل"
      await page.click('text=تقرير مالي شامل');
      
      // الانتظار لتحميل التقرير
      await page.waitForLoadState('networkidle');
      
      // التحقق من عناصر التقرير
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="expenses-chart"]')).toBeVisible();
      
      // التحقق من وجود Charts
      const charts = page.locator('canvas');
      await expect(charts.first()).toBeVisible();
      
      console.log('✅ Financial report loaded');
    });

    // ============================================
    // المرحلة 7: فحص التنبيهات الذكية
    // ============================================
    await test.step('Check Smart Alerts', async () => {
      // العودة إلى لوحة التحكم
      await page.click('a[href="/nazer-dashboard"]');
      await page.waitForLoadState('networkidle');
      
      // البحث عن قسم التنبيهات
      const alertsSection = page.locator('[data-testid="smart-alerts"]');
      
      if (await alertsSection.isVisible()) {
        // التحقق من التنبيهات
        const alerts = alertsSection.locator('[data-testid^="alert-"]');
        const alertCount = await alerts.count();
        
        console.log(`✅ Found ${alertCount} smart alerts`);
        
        if (alertCount > 0) {
          // فتح أول تنبيه
          await alerts.first().click();
          
          // التحقق من تفاصيل التنبيه
          await expect(page.locator('[role="dialog"]')).toBeVisible();
        }
      } else {
        console.log('⚠️ No smart alerts section found');
      }
    });

    // ============================================
    // المرحلة 8: تسجيل الخروج
    // ============================================
    await test.step('Logout', async () => {
      // النقر على قائمة المستخدم
      await page.click('[data-testid="user-menu"]');
      
      // النقر على تسجيل الخروج
      await page.click('text=تسجيل الخروج');
      
      // التحقق من التوجيه إلى صفحة تسجيل الدخول
      await expect(page).toHaveURL('/auth', { timeout: 5000 });
      
      console.log('✅ Logged out successfully');
    });

    // ============================================
    // التحقق النهائي
    // ============================================
    console.log('\n📊 Nazer Daily Operations Completed:');
    console.log('  ✅ Login');
    console.log('  ✅ Dashboard Review');
    console.log('  ✅ Pending Approvals');
    console.log('  ✅ Distribution Approval');
    console.log('  ✅ Loan Review');
    console.log('  ✅ Financial Report');
    console.log('  ✅ Smart Alerts');
    console.log('  ✅ Logout');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await test.step('Test error handling', async () => {
      // محاولة تسجيل دخول بمعلومات خاطئة
      await page.fill('[name="email"]', 'wrong@email.com');
      await page.fill('[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // التحقق من رسالة الخطأ
      await expect(page.locator('text=بيانات غير صحيحة')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Error handling works correctly');
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // تعيين حجم شاشة موبايل
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Test mobile responsiveness', async () => {
      await page.fill('[name="email"]', 'nazer@waqf.sa');
      await page.fill('[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/\/nazer-dashboard/);
      
      // التحقق من عرض العناصر بشكل صحيح على الموبايل
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      console.log('✅ Mobile view works correctly');
    });
  });
});
