/**
 * نظام التحقق من الإصدار وتحديث الكاش تلقائياً
 * Enhanced version checking with automatic cache busting
 */

import { APP_VERSION, isNewerVersion } from './version';
import { clearAllCaches } from './clearCache';
import { productionLogger } from './logger/production-logger';

const VERSION_STORAGE_KEY = 'waqf_app_version';
const CACHE_BUST_KEY = 'waqf_cache_bust_count';
const MAX_CACHE_BUST_RETRIES = 3;

/**
 * فحص أخطاء تحميل الـ chunks
 */
function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('loading chunk') ||
      msg.includes('loading css chunk')
    );
  }
  return false;
}

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
      
      // تنظيف الكاش بشكل عميق
      await clearAllCaches();
      
      // مسح sessionStorage أيضاً (ما عدا البيانات الضرورية)
      try {
        sessionStorage.removeItem('chunk_load_failures');
        sessionStorage.removeItem(CACHE_BUST_KEY);
      } catch {
        // Ignore storage errors
      }
      
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
 * معالجة أخطاء تحميل الـ chunks بإعادة التحميل
 */
export async function handleChunkLoadError(error: unknown): Promise<void> {
  if (!isChunkLoadError(error)) return;
  
  const bustCount = parseInt(sessionStorage.getItem(CACHE_BUST_KEY) || '0', 10);
  
  if (bustCount < MAX_CACHE_BUST_RETRIES) {
    sessionStorage.setItem(CACHE_BUST_KEY, String(bustCount + 1));
    productionLogger.info(`🔄 إعادة تحميل الصفحة (محاولة ${bustCount + 1}/${MAX_CACHE_BUST_RETRIES})`);
    
    // مسح الكاش وإعادة التحميل
    await clearAllCaches();
    window.location.reload();
  } else {
    sessionStorage.removeItem(CACHE_BUST_KEY);
    productionLogger.error('❌ فشل تحميل التطبيق بعد عدة محاولات');
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
