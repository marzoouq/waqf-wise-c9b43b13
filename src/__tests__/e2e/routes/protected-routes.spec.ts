/**
 * اختبارات E2E للمسارات المحمية
 * Protected Routes E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Public Routes', () => {
  const publicRoutes = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/about', name: 'About Page' },
    { path: '/services', name: 'Services Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/faq', name: 'FAQ Page' },
    { path: '/privacy', name: 'Privacy Page' },
    { path: '/terms', name: 'Terms Page' },
  ];

  for (const route of publicRoutes) {
    test(`${route.name} should be accessible without authentication`, async ({ page }) => {
      await page.goto(route.path);
      
      // يجب أن لا يتم إعادة التوجيه لصفحة تسجيل الدخول
      const currentUrl = page.url();
      expect(currentUrl).toContain(route.path);
      
      // يجب أن تُعرض الصفحة بشكل صحيح
      await page.waitForLoadState('domcontentloaded');
      
      console.log(`✅ ${route.name} accessible`);
    });
  }
});

test.describe('Protected Staff Routes', () => {
  const staffRoutes = [
    { path: '/dashboard', name: 'Dashboard', roles: ['admin', 'nazer', 'accountant', 'cashier', 'archivist'] },
    { path: '/beneficiaries', name: 'Beneficiaries', roles: ['admin', 'nazer', 'accountant', 'cashier'] },
    { path: '/properties', name: 'Properties', roles: ['admin', 'nazer', 'accountant'] },
    { path: '/accounting', name: 'Accounting', roles: ['admin', 'nazer', 'accountant'] },
    { path: '/archive', name: 'Archive', roles: ['admin', 'nazer', 'archivist'] },
    { path: '/staff/users', name: 'Users Management', roles: ['admin'] },
    { path: '/settings', name: 'Settings', roles: ['admin', 'nazer'] },
  ];

  test('should redirect unauthenticated users to login', async ({ page }) => {
    for (const route of staffRoutes) {
      await page.goto(route.path);
      
      // يجب إعادة التوجيه
      await page.waitForURL(/\/(login|landing|redirect)/);
      
      console.log(`✅ ${route.name} redirects unauthenticated users`);
    }
  });

  test('should allow authenticated admin to access all routes', async ({ page }) => {
    // تسجيل دخول كمدير
    await page.goto('/login');
    await page.getByRole('tab', { name: 'الموظفين' }).click();
    await page.getByPlaceholder('البريد الإلكتروني').fill('admin@waqf.test');
    await page.getByPlaceholder('كلمة المرور').fill('admin123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    await page.waitForURL('/dashboard');
    
    for (const route of staffRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');
      
      // يجب أن تُعرض الصفحة للمدير
      const currentUrl = page.url();
      expect(currentUrl).toContain(route.path);
      
      console.log(`✅ Admin can access ${route.name}`);
    }
  });
});

test.describe('Beneficiary Portal Routes', () => {
  const beneficiaryRoutes = [
    { path: '/beneficiary/portal', name: 'Portal Home' },
    { path: '/beneficiary/portal/requests', name: 'Requests' },
    { path: '/beneficiary/portal/payments', name: 'Payments' },
    { path: '/beneficiary/portal/documents', name: 'Documents' },
    { path: '/beneficiary/portal/profile', name: 'Profile' },
  ];

  test('should redirect unauthenticated users from beneficiary portal', async ({ page }) => {
    for (const route of beneficiaryRoutes) {
      await page.goto(route.path);
      
      // يجب إعادة التوجيه
      await page.waitForURL(/\/(login|landing)/);
      
      console.log(`✅ ${route.name} redirects unauthenticated users`);
    }
  });

  test('should allow authenticated beneficiary to access portal', async ({ page }) => {
    // تسجيل دخول كمستفيد
    await page.goto('/login');
    await page.getByPlaceholder('رقم الهوية الوطنية').fill('1234567890');
    await page.getByPlaceholder('كلمة المرور').fill('test123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    // انتظار التوجيه
    await page.waitForURL(/beneficiary/);
    
    console.log('✅ Beneficiary logged in successfully');
    
    // التحقق من إمكانية الوصول للصفحات
    for (const route of beneficiaryRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');
      
      console.log(`✅ Beneficiary can access ${route.name}`);
    }
  });
});

test.describe('Route Navigation', () => {
  test('should navigate between pages without errors', async ({ page }) => {
    await page.goto('/');
    
    // التنقل عبر الصفحات العامة
    const links = [
      { text: 'حول المنصة', expectedUrl: '/about' },
      { text: 'خدماتنا', expectedUrl: '/services' },
      { text: 'تواصل معنا', expectedUrl: '/contact' },
    ];
    
    for (const link of links) {
      const linkElement = page.getByRole('link', { name: link.text }).first();
      if (await linkElement.isVisible()) {
        await linkElement.click();
        await page.waitForLoadState('domcontentloaded');
        
        expect(page.url()).toContain(link.expectedUrl);
        console.log(`✅ Navigated to ${link.text}`);
        
        await page.goBack();
      }
    }
  });

  test('should handle 404 routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-route-123');
    
    // يجب أن تُعرض صفحة 404 أو إعادة توجيه
    const notFoundText = page.locator('text=404');
    const redirected = !page.url().includes('nonexistent');
    
    expect(await notFoundText.isVisible() || redirected).toBeTruthy();
    
    console.log('✅ 404 handling works correctly');
  });

  test('should preserve query parameters during navigation', async ({ page }) => {
    await page.goto('/beneficiaries?search=test&status=active');
    
    // التحقق من الحفاظ على البارامترات
    const url = page.url();
    expect(url).toContain('search=test');
    expect(url).toContain('status=active');
    
    console.log('✅ Query parameters preserved');
  });
});

test.describe('Role-Based Redirects', () => {
  test('should redirect admin to correct dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('tab', { name: 'الموظفين' }).click();
    await page.getByPlaceholder('البريد الإلكتروني').fill('admin@waqf.test');
    await page.getByPlaceholder('كلمة المرور').fill('admin123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    // يجب التوجيه للوحة تحكم المدير
    await page.waitForURL(/dashboard/);
    
    console.log('✅ Admin redirected to admin dashboard');
  });

  test('should redirect beneficiary to portal', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('رقم الهوية الوطنية').fill('1234567890');
    await page.getByPlaceholder('كلمة المرور').fill('test123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    
    // يجب التوجيه لبوابة المستفيدين
    await page.waitForURL(/beneficiary/);
    
    console.log('✅ Beneficiary redirected to portal');
  });
});
