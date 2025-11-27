/**
 * دوال مساعدة لنظام تتبع الأخطاء
 */

import { IGNORE_ERROR_PATTERNS } from './tracker-config';

/**
 * فحص إذا كان يجب تجاهل الخطأ
 */
export function shouldIgnoreError(
  message: string, 
  additionalData?: Record<string, unknown>
): boolean {
  // فحص رسالة الخطأ الرئيسية
  if (IGNORE_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
    return true;
  }
  
  // فحص additional_data للتأكد من عدم تسجيل أخطاء auth
  if (additionalData?.request_url) {
    const url = String(additionalData.request_url);
    if (url.includes('/auth/v1/user') || 
        url.includes('/auth/v1/session') ||
        url.includes('/auth/v1/token')) {
      return true;
    }
  }
  
  return false;
}

/**
 * تنظيف URL من المعلومات الحساسة
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove sensitive query parameters
    urlObj.searchParams.delete('__lovable_token');
    urlObj.searchParams.delete('token');
    urlObj.searchParams.delete('access_token');
    
    let cleanedUrl = urlObj.toString();
    // Truncate to 500 characters max
    if (cleanedUrl.length > 500) {
      cleanedUrl = cleanedUrl.substring(0, 497) + '...';
    }
    return cleanedUrl;
  } catch {
    // If URL parsing fails, just truncate the string
    return url.length > 500 ? url.substring(0, 497) + '...' : url;
  }
}

/**
 * تنظيف رسالة الخطأ
 */
export function cleanErrorMessage(message: unknown): string {
  if (typeof message === 'string') {
    return message;
  }
  
  if (typeof message === 'object' && message !== null) {
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
  
  return String(message || 'Unknown error');
}

/**
 * تنظيف البيانات الإضافية للتسلسل JSON
 */
export function sanitizeAdditionalData(
  data: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!data || Object.keys(data).length === 0) {
    return undefined;
  }
  
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return { raw: String(data) };
  }
}

/**
 * إنشاء مفتاح فريد للخطأ
 */
export function createErrorKey(errorType: string, errorMessage: string): string {
  return `${errorType}-${errorMessage}`;
}

/**
 * فحص إذا كان الخطأ متعلق بالمصادقة
 */
export function isAuthRelatedUrl(url: string): boolean {
  return url.includes('log-error') || 
         url.includes('analytics') ||
         url.includes('auth/v1/user') ||
         url.includes('auth/v1/session');
}
