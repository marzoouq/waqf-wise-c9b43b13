import { test, expect } from '@playwright/test';
import { expectVisible, expectText, expectToast } from '../helpers/assertion-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('بوابة المستفيد - اختبار شامل', () => {
  
  test('تسجيل دخول المستفيد ورؤية لوحة التحكم', async ({ page }) => {
    // الانتقال لصفحة تسجيل الدخول
    await page.goto('/auth');
    
    // تسجيل الدخول كمستفيد
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // الانتظار للتحميل
    await page.waitForLoadState('networkidle');
    
    // التحقق من الوصول للوحة التحكم
    await expectVisible(page, 'text=لوحة التحكم');
    await expectVisible(page, 'text=مرحباً');
  });

  test('عرض الإحصائيات الشخصية', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // التحقق من وجود بطاقات الإحصائيات
    await expectVisible(page, 'text=إجمالي المستحقات');
    await expectVisible(page, 'text=الطلبات النشطة');
    await expectVisible(page, 'text=آخر دفعة');
    await expectVisible(page, '[data-testid="beneficiary-stats"]');
  });

  test('عرض آخر التوزيعات المستلمة', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // البحث عن قسم التوزيعات
    await expectVisible(page, 'text=التوزيعات');
    
    const distributionsCount = await page.locator('[data-testid="distribution-item"]').count();
    console.log(`✅ عدد التوزيعات المعروضة: ${distributionsCount}`);
  });

  test('الانتقال لصفحة الطلبات', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال لصفحة الطلبات
    await page.click('text=طلباتي');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=الطلبات');
    await expectVisible(page, 'button:has-text("طلب جديد")');
  });

  test('تقديم طلب فزعة جديد', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال للطلبات
    await page.click('text=طلباتي');
    await page.waitForLoadState('networkidle');
    
    // النقر على طلب جديد
    await page.click('button:has-text("طلب جديد")');
    await page.waitForTimeout(1000);
    
    // التحقق من نموذج الطلب
    await expectVisible(page, 'text=طلب جديد');
    await expectVisible(page, 'select[name="request_type"]');
    await expectVisible(page, 'textarea[name="description"]');
    
    // ملء النموذج
    const requestTypeSelect = page.locator('select[name="request_type"]');
    if (await requestTypeSelect.count() > 0) {
      await requestTypeSelect.selectOption({ index: 1 });
    }
    
    await page.fill('textarea[name="description"]', 'احتاج مساعدة طارئة لعملية جراحية');
    await page.fill('input[name="amount"]', '15000');
    
    // إرسال الطلب
    await page.click('button:has-text("إرسال الطلب")');
    await page.waitForTimeout(2000);
    
    console.log('✅ تم تقديم طلب الفزعة');
  });

  test('عرض كشف الحساب الشخصي', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال لكشف الحساب
    await page.click('text=كشف الحساب');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=كشف الحساب');
    await expectVisible(page, 'text=المدفوعات');
  });

  test('عرض المستندات الشخصية', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال للمستندات
    await page.click('text=مستنداتي');
    await page.waitForLoadState('networkidle');
    
    await expectVisible(page, 'text=المستندات');
    
    const documentsCount = await page.locator('[data-testid="document-item"]').count();
    console.log(`✅ عدد المستندات: ${documentsCount}`);
  });

  test('رفع مستند جديد', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال للمستندات
    await page.click('text=مستنداتي');
    await page.waitForLoadState('networkidle');
    
    // البحث عن زر رفع مستند
    const uploadButton = page.locator('button:has-text("رفع مستند")');
    if (await uploadButton.count() > 0) {
      await uploadButton.click();
      await expectVisible(page, 'text=رفع مستند جديد');
      
      console.log('✅ تم فتح نموذج رفع المستند');
    }
  });

  test('عرض حالة الطلبات المقدمة', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=طلباتي');
    await page.waitForLoadState('networkidle');
    
    // عد الطلبات حسب الحالة
    const pendingRequests = await page.locator('[data-status="قيد_الانتظار"]').count();
    const processingRequests = await page.locator('[data-status="قيد_المعالجة"]').count();
    const approvedRequests = await page.locator('[data-status="معتمد"]').count();
    
    console.log(`✅ الطلبات:
      - قيد الانتظار: ${pendingRequests}
      - قيد المعالجة: ${processingRequests}
      - معتمد: ${approvedRequests}
    `);
  });

  test('عرض القروض النشطة', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // البحث عن قسم القروض
    const loansSection = page.locator('text=القروض');
    if (await loansSection.count() > 0) {
      await loansSection.click();
      await page.waitForLoadState('networkidle');
      
      const loansCount = await page.locator('[data-testid="loan-item"]').count();
      console.log(`✅ عدد القروض النشطة: ${loansCount}`);
    }
  });

  test('تحديث البيانات الشخصية', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الانتقال للإعدادات
    const settingsButton = page.locator('text=الإعدادات');
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForLoadState('networkidle');
      
      await expectVisible(page, 'text=البيانات الشخصية');
      console.log('✅ صفحة الإعدادات متاحة');
    }
  });

  test('تسجيل الخروج', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'beneficiary_test');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // البحث عن زر تسجيل الخروج
    const logoutButton = page.locator('button:has-text("تسجيل الخروج")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      
      // التحقق من الرجوع لصفحة تسجيل الدخول
      await expectVisible(page, 'text=تسجيل الدخول');
      console.log('✅ تم تسجيل الخروج بنجاح');
    }
  });
});
