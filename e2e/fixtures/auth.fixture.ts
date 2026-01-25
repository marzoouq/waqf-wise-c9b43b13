import { test as base, expect, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication Test Fixtures
 * أدوات مساعدة لاختبارات المصادقة
 */

export const TEST_CREDENTIALS = {
  admin: { email: 'admin@test.waqf.sa', password: 'TestAdmin123!' },
  nazer: { email: 'nazer@test.waqf.sa', password: 'TestNazer123!' },
  accountant: { email: 'accountant@test.waqf.sa', password: 'TestAccountant123!' },
  beneficiary: { email: 'beneficiary@test.waqf.sa', password: 'TestBeneficiary123!' },
};

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export type UserRole = 'admin' | 'nazer' | 'accountant' | 'beneficiary' | 'cashier' | 'archivist' | string;

interface AuthFixtures {
  supabase: SupabaseClient;
  loginAs: (role: UserRole) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoggedIn: () => Promise<boolean>;
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  supabase: async (_, use) => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await use(client);
    // تنظيف: تسجيل الخروج بعد انتهاء الاختبار
    try {
      await client.auth.signOut();
    } catch {
      // ignore cleanup errors
    }
  },

  loginAs: async ({ page }, use) => {
    const loginAs = async (role: UserRole): Promise<boolean> => {
      try {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        if (role === 'beneficiary') {
          // التبديل إلى تبويب المستفيدين
          const beneficiaryTab = page.locator('button:has-text("المستفيدون")');
          if (await beneficiaryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await beneficiaryTab.click();
            await page.waitForTimeout(500);
          }

          // استخدام رقم هوية افتراضي للمستفيد
          const nationalId = '1234567890';
          await page.fill('#national-id', nationalId);
          await page.fill('#beneficiary-password', TEST_CREDENTIALS.beneficiary.password);
        } else {
          // التبديل إلى تبويب الموظفين
          const staffTab = page.locator('button:has-text("الموظفون")');
          if (await staffTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await staffTab.click();
            await page.waitForTimeout(500);
          }

          // استخدام بيانات الاعتماد حسب الدور
          const credentials = (TEST_CREDENTIALS as any)[role] || TEST_CREDENTIALS.admin;
          await page.fill('#staff-email', credentials.email);
          await page.fill('#staff-password', credentials.password);
        }

        // إرسال النموذج وانتظار التوجيه
        await Promise.all([
          page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => null),
          page.click('button[type="submit"]'),
        ]);

        // التحقق من نجاح تسجيل الدخول
        const currentUrl = page.url();
        const isSuccess = /redirect|dashboard|portal|admin|nazer|accountant|beneficiary/.test(currentUrl);

        if (isSuccess) {
          console.log(`✓ تسجيل الدخول نجح كـ ${role}`);
          return true;
        }

        // فحص بديل: التحقق من عدم وجود صفحة login
        const onLoginPage = await page.locator('form').isVisible().catch(() => false);
        return !onLoginPage;
      } catch (error) {
        console.warn(`✗ خطأ في تسجيل الدخول كـ ${role}:`, error);
        return false;
      }
    };
    await use(loginAs);
  },

  loginWithCredentials: async ({ page }, use) => {
    const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
      try {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // التأكد من وجود تبويب الموظفين
        const staffTab = page.locator('button:has-text("الموظفون")');
        if (await staffTab.isVisible({ timeout: 2000 }).catch(() => false)) {
          await staffTab.click();
          await page.waitForTimeout(500);
        }

        await page.fill('#staff-email', email);
        await page.fill('#staff-password', password);

        await Promise.all([
          page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => null),
          page.click('button[type="submit"]'),
        ]);

        const currentUrl = page.url();
        const isSuccess = !currentUrl.includes('/login');

        if (isSuccess) {
          console.log('✓ تسجيل الدخول نجح بالبيانات المخصصة');
        }

        return isSuccess;
      } catch (error) {
        console.warn('✗ خطأ في تسجيل الدخول:', error);
        return false;
      }
    };
    await use(loginWithCredentials);
  },

  logout: async ({ page }, use) => {
    const logout = async (): Promise<void> => {
      try {
        // محاولة إيجاد وضغط زر تسجيل الخروج
        const logoutSelectors = [
          'button:has-text("تسجيل الخروج")',
          'button:has-text("Logout")',
          '[data-testid="logout"]',
          'a:has-text("تسجيل الخروج")',
          'a:has-text("Logout")',
        ];

        for (const selector of logoutSelectors) {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
            await Promise.all([
              page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10000 }).catch(() => null),
              button.click(),
            ]);
            console.log('✓ تسجيل الخروج نجح');
            return;
          }
        }

        // إذا لم يُعثر على زر: تنظيف يدوي للجلسة
        console.log('⚠ لم يُعثر على زر خروج، تنظيف الجلسة يدوياً');
        await page.evaluate(() => {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
        });
        await page.goto('/login');
      } catch (error) {
        console.warn('✗ خطأ في تسجيل الخروج:', error);
      }
    };
    await use(logout);
  },

  isLoggedIn: async ({ page }, use) => {
    const isLoggedIn = async (): Promise<boolean> => {
      try {
        const currentUrl = page.url();

        // فحص 1: التحقق من URL
        if (!currentUrl.includes('/login')) {
          return true;
        }

        // فحص 2: التحقق من وجود جلسة في localStorage
        const hasSession = await page.evaluate(() => {
          return Object.keys(localStorage).some(key =>
            (key.includes('supabase') || key.startsWith('sb-')) &&
            localStorage.getItem(key)?.includes('access_token')
          );
        });

        return hasSession;
      } catch (error) {
        console.warn('✗ خطأ في فحص حالة تسجيل الدخول:', error);
        return false;
      }
    };
    await use(isLoggedIn);
  },
});

export { expect };

/**
 * إنشاء عميل Supabase مصادق حسب الدور
 * Create authenticated Supabase client for specific role
 */
export async function createAuthenticatedClient(role: UserRole): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠ Supabase not configured');
    return null;
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const credentials = (TEST_CREDENTIALS as any)[role] || TEST_CREDENTIALS.admin;

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.warn(`⚠ فشل تسجيل الدخول لـ ${role}:`, error.message);
      return client; // إرجاع العميل حتى لو لم يُصادق
    }

    if (data.session) {
      console.log(`✓ تم إنشاء عميل مصادق لـ ${role}`);
    }

    return client;
  } catch (error) {
    console.warn(`✗ خطأ في إنشاء عميل مصادق لـ ${role}:`, error);
    return client;
  }
}

/**
 * التحقق من إعداد Supabase
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * انتظار اكتمال المصادقة
 * Wait for authentication to complete
 */
export async function waitForAuth(page: Page, timeout = 10000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // فحص 1: التحقق من localStorage
      const hasSession = await page.evaluate(() => {
        return Object.keys(localStorage).some(key =>
          (key.includes('supabase') || key.startsWith('sb-')) &&
          localStorage.getItem(key)?.includes('access_token')
        );
      });

      if (hasSession) {
        console.log('✓ اكتملت المصادقة');
        return true;
      }

      // فحص 2: التحقق من اختفاء مؤشرات التحميل
      const loadingGone = await page.locator('[data-testid="loading"], .skeleton, .spinner').count() === 0;

      if (loadingGone && !page.url().includes('/login')) {
        return true;
      }

      await page.waitForTimeout(250);
    } catch (error) {
      // استمر في المحاولة حتى انتهاء المهلة
    }
  }

  console.warn('⚠ انتهت مهلة انتظار المصادقة');
  return false;
}