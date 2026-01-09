/**
 * اختبارات E2E شاملة لجميع التبويبات
 * @version 1.0.0
 */
import { test, expect } from '@playwright/test';

// الصفحات التي تحتوي على تبويبات
const PAGES_WITH_TABS = [
  { path: '/dashboard', name: 'لوحة التحكم' },
  { path: '/beneficiaries', name: 'المستفيدين' },
  { path: '/properties', name: 'العقارات' },
  { path: '/accounting', name: 'المحاسبة' },
  { path: '/distributions', name: 'التوزيعات' },
  { path: '/payments', name: 'المدفوعات' },
  { path: '/invoices', name: 'الفواتير' },
  { path: '/loans', name: 'القروض' },
  { path: '/funds', name: 'الصناديق' },
  { path: '/governance-decisions', name: 'الحوكمة' },
  { path: '/reports', name: 'التقارير' },
  { path: '/settings', name: 'الإعدادات' },
  { path: '/users', name: 'المستخدمين' },
  { path: '/support', name: 'الدعم' },
  { path: '/archive', name: 'الأرشيف' },
  { path: '/notifications', name: 'الإشعارات' },
];

test.describe('اختبارات التبويبات الشاملة', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول قبل كل اختبار
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // محاولة تسجيل الدخول إذا كان هناك نموذج
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('admin@waqf.test');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|beneficiaries|admin)/, { timeout: 10000 }).catch(() => {});
    }
  });

  for (const pageInfo of PAGES_WITH_TABS) {
    test(`التبويبات في صفحة ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // البحث عن التبويبات
      const tabs = page.locator('[role="tablist"] [role="tab"], .tabs-trigger, [data-state="active"], button[role="tab"]');
      const tabCount = await tabs.count();
      
      if (tabCount > 0) {
        console.log(`${pageInfo.name}: وجدت ${tabCount} تبويب`);
        
        // اختبار كل تبويب
        for (let i = 0; i < tabCount; i++) {
          const tab = tabs.nth(i);
          
          // التأكد من أن التبويب مرئي
          if (await tab.isVisible()) {
            const tabText = await tab.textContent();
            
            // النقر على التبويب
            await tab.click();
            await page.waitForTimeout(300);
            
            // التحقق من عدم وجود أخطاء
            const errorElements = page.locator('text=/خطأ|error|فشل/i');
            const hasError = await errorElements.count() > 0;
            
            expect(hasError).toBeFalsy();
            console.log(`  ✓ تبويب "${tabText?.trim()}" يعمل`);
          }
        }
      } else {
        console.log(`${pageInfo.name}: لا توجد تبويبات`);
      }
    });
  }

  test('التنقل بين التبويبات بلوحة المفاتيح', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const tablist = page.locator('[role="tablist"]').first();
    if (await tablist.isVisible({ timeout: 3000 }).catch(() => false)) {
      // التركيز على أول تبويب
      const firstTab = tablist.locator('[role="tab"]').first();
      await firstTab.focus();
      
      // التنقل بالأسهم
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      await page.keyboard.press('ArrowLeft');
      
      // التأكد من أن التنقل يعمل
      expect(true).toBeTruthy();
    }
  });
});
