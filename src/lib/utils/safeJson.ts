/**
 * معالجة آمنة للـ JSON.parse
 * Safe JSON parsing utility
 */

/**
 * تحليل JSON بشكل آمن مع قيمة افتراضية
 * @param value - القيمة المراد تحليلها
 * @param defaultValue - القيمة الافتراضية في حالة الفشل
 * @param key - مفتاح localStorage (اختياري) لمسح البيانات التالفة
 */
export function safeJsonParse<T>(
  value: string | null | undefined,
  defaultValue: T,
  key?: string
): T {
  // إرجاع القيمة الافتراضية إذا كانت القيمة فارغة
  if (!value || value === 'undefined' || value === 'null') {
    return defaultValue;
  }

  const trimmed = value.trim();
  
  // التحقق من أن القيمة تبدأ بـ [ أو { (JSON صالح)
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    console.warn(`[safeJsonParse] Invalid JSON value detected${key ? ` for key: ${key}` : ''}`);
    
    // مسح البيانات التالفة من localStorage
    if (key) {
      try {
        localStorage.removeItem(key);
        console.info(`[safeJsonParse] Removed corrupted data for key: ${key}`);
      } catch {
        // تجاهل خطأ الحذف
      }
    }
    
    return defaultValue;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    console.warn(`[safeJsonParse] JSON parse failed${key ? ` for key: ${key}` : ''}:`, error);
    
    // مسح البيانات التالفة من localStorage
    if (key) {
      try {
        localStorage.removeItem(key);
        console.info(`[safeJsonParse] Removed corrupted data for key: ${key}`);
      } catch {
        // تجاهل خطأ الحذف
      }
    }
    
    return defaultValue;
  }
}

/**
 * تحويل كائن إلى JSON بشكل آمن
 */
export function safeJsonStringify(value: unknown, fallback: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('[safeJsonStringify] Failed to stringify value:', error);
    return fallback;
  }
}

/**
 * قراءة من localStorage بشكل آمن مع تحليل JSON
 */
export function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    return safeJsonParse(value, defaultValue, key);
  } catch (error) {
    console.warn(`[safeLocalStorageGet] Failed to read key: ${key}`, error);
    return defaultValue;
  }
}

/**
 * الكتابة إلى localStorage بشكل آمن
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, safeJsonStringify(value));
    return true;
  } catch (error) {
    console.warn(`[safeLocalStorageSet] Failed to write key: ${key}`, error);
    return false;
  }
}
