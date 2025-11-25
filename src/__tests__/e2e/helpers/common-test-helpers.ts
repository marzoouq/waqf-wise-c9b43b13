import { Page } from '@playwright/test';

/**
 * دالة مساعدة لتسجيل الدخول المرن
 * تدعم تسجيل الدخول بالبريد الإلكتروني أو اسم المستخدم أو رقم الهوية
 */
export async function flexibleLogin(
  page: Page, 
  identifier: string, 
  password: string
) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // البحث عن حقل تسجيل الدخول (email, username, أو رقم الهوية)
  const loginField = page.locator(
    'input[type="email"], input[name="username"], input[name="identifier"], input[placeholder*="البريد"], input[placeholder*="الهوية"], input[placeholder*="المستخدم"]'
  ).first();
  
  await loginField.waitFor({ state: 'visible', timeout: 5000 });
  await loginField.fill(identifier);

  // ملء حقل كلمة المرور
  const passwordField = page.locator('input[type="password"]');
  await passwordField.fill(password);

  // النقر على زر تسجيل الدخول
  await page.click('button[type="submit"]');

  // الانتظار للتوجيه
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * التحقق من وجود عنصر مع مهلة زمنية
 */
export async function waitForElementSafely(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من وجود نص في الصفحة
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
  const count = await page.locator(`text=${text}`).count();
  return count > 0;
}

/**
 * الحصول على عدد العناصر بأمان
 */
export async function getElementCount(
  page: Page,
  selector: string
): Promise<number> {
  try {
    return await page.locator(selector).count();
  } catch {
    return 0;
  }
}

/**
 * النقر على عنصر بأمان مع إعادة المحاولة
 */
export async function safeClick(
  page: Page,
  selector: string,
  retries: number = 3
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await page.click(selector, { timeout: 5000 });
      return true;
    } catch (error) {
      if (i === retries - 1) {
        console.warn(`Failed to click ${selector} after ${retries} attempts`);
        return false;
      }
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

/**
 * ملء نموذج بأمان
 */
export async function safeFillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [name, value] of Object.entries(fields)) {
    try {
      const field = page.locator(`[name="${name}"]`).first();
      await field.waitFor({ state: 'visible', timeout: 3000 });
      await field.fill(value);
    } catch (error) {
      console.warn(`Failed to fill field ${name}:`, error);
    }
  }
}

/**
 * التقاط لقطة شاشة عند الفشل
 */
export async function captureOnFailure(
  page: Page,
  testName: string
): Promise<void> {
  try {
    const timestamp = Date.now();
    await page.screenshot({
      path: `screenshots/failure-${testName}-${timestamp}.png`,
      fullPage: true,
    });
  } catch (error) {
    console.warn('Failed to capture screenshot:', error);
  }
}
