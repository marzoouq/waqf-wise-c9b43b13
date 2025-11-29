/**
 * نظام التحقق من الإصدار وتحديث الكاش تلقائياً
 */

import { APP_VERSION, isNewerVersion } from './version';
import { clearAllCaches } from './clearCache';
import { productionLogger } from './logger/production-logger';

const VERSION_STORAGE_KEY = 'waqf_app_version';

/**
 * التحقق من الإصدار وتنظيف الكاش إذا لزم الأمر
 * @returns true إذا تم تحديث الكاش
 */
export async function checkAndUpdateVersion(): Promise<boolean> {
  try {
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    
    // إذا كان إصدار جديد أو أول مرة
    if (!storedVersion || isNewerVersion(APP_VERSION, storedVersion)) {
      productionLogger.info(`🔄 تحديث التطبيق: ${storedVersion || 'جديد'} → ${APP_VERSION}`);
      
      // حفظ البيانات المهمة قبل التنظيف
      const keysToPreserve = ['theme', 'vite-ui-theme', 'language', 'i18nextLng'];
      const preserved: Record<string, string | null> = {};
      keysToPreserve.forEach(key => {
        preserved[key] = localStorage.getItem(key);
      });
      
      // تنظيف الكاش
      await clearAllCaches();
      
      // استعادة البيانات المهمة
      Object.entries(preserved).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });
      
      // حفظ الإصدار الجديد
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
      
      productionLogger.info(`✅ تم تحديث التطبيق للإصدار ${APP_VERSION}`);
      return true;
    }
    
    return false;
  } catch (error) {
    productionLogger.error('خطأ في التحقق من الإصدار:', error);
    // في حالة الخطأ، احفظ الإصدار الحالي على الأقل
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    return false;
  }
}

/**
 * الحصول على الإصدار المخزن
 */
export function getStoredVersion(): string | null {
  return localStorage.getItem(VERSION_STORAGE_KEY);
}

/**
 * التحقق إذا كان هناك تحديث متاح
 */
export function hasUpdate(): boolean {
  const storedVersion = getStoredVersion();
  return !storedVersion || isNewerVersion(APP_VERSION, storedVersion);
}
