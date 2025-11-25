import { Page } from '@playwright/test';

/**
 * معالج أخطاء شامل لالاختبارات
 */

/**
 * إعادة المحاولة عند الفشل
 */
export async function retryOnFailure<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * التعامل مع أخطاء الشبكة
 */
export async function handleNetworkErrors(page: Page): Promise<void> {
  page.on('pageerror', (error) => {
    console.error('Page error:', error.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  page.on('requestfailed', (request) => {
    console.error('Request failed:', request.url(), request.failure()?.errorText);
  });
}

/**
 * الانتظار مع معالجة الأخطاء
 */
export async function safeWait(
  page: Page,
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  checkInterval: number = 500
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      if (await condition()) {
        return true;
      }
    } catch (error) {
      console.warn('Condition check failed:', error);
    }
    
    await page.waitForTimeout(checkInterval);
  }
  
  return false;
}

/**
 * التقاط حالة الصفحة عند الفشل
 */
export async function capturePageState(page: Page, testName: string): Promise<void> {
  try {
    const timestamp = Date.now();
    
    // لقطة شاشة
    await page.screenshot({
      path: `test-results/screenshots/${testName}-${timestamp}.png`,
      fullPage: true,
    });
    
    // HTML
    const html = await page.content();
    const fs = await import('fs/promises');
    await fs.writeFile(
      `test-results/html/${testName}-${timestamp}.html`,
      html,
      'utf-8'
    );
    
    // Console logs
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
  } catch (error) {
    console.warn('Failed to capture page state:', error);
  }
}

/**
 * التحقق من وجود أخطاء في الصفحة
 */
export async function checkForPageErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  // التحقق من رسائل الخطأ المرئية
  const errorMessages = await page.locator('[role="alert"], .error-message, .text-destructive').allTextContents();
  errors.push(...errorMessages.filter(msg => msg.trim().length > 0));
  
  return errors;
}

/**
 * إعادة تحميل الصفحة عند الحاجة
 */
export async function reloadIfStuck(page: Page, timeout: number = 30000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch (error) {
    console.warn('Page appears stuck, reloading...');
    await page.reload();
    await page.waitForLoadState('networkidle');
  }
}
