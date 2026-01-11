/**
 * نظام التحقق من الإصدار وتحديث الكاش تلقائياً
 * Enhanced version checking with automatic cache busting
 */

import { APP_VERSION, isNewerVersion } from './version';
import { clearAllCaches } from './clearCache';
import { productionLogger } from './logger/production-logger';
import { isChunkLoadError, getChunkErrorInfo, logChunkError } from './errors/chunk-error-handler';

const VERSION_STORAGE_KEY = 'waqf_app_version';
const CACHE_BUST_KEY = 'waqf_cache_bust_count';
const MAX_CACHE_BUST_RETRIES = 3;

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
      
      // ✅ نكتفي بتحديث رقم الإصدار فقط
      // Vite يستخدم content hashing في أسماء الملفات (index-DzDkFqAu.js)
      // مما يضمن تحميل الملفات الجديدة تلقائياً بدون الحاجة لمسح الكاش
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
 * الآن تستخدم النظام الموحد
 */
export async function handleChunkLoadError(error: unknown): Promise<void> {
  if (!isChunkLoadError(error)) return;
  
  const errorInfo = getChunkErrorInfo(error);
  logChunkError(error, { action: 'reload' });
  
  const bustCount = parseInt(sessionStorage.getItem(CACHE_BUST_KEY) || '0', 10);
  
  if (bustCount < MAX_CACHE_BUST_RETRIES) {
    sessionStorage.setItem(CACHE_BUST_KEY, String(bustCount + 1));
    productionLogger.info(`🔄 إعادة تحميل الصفحة (محاولة ${bustCount + 1}/${MAX_CACHE_BUST_RETRIES})`);
    productionLogger.info(`📋 نوع الخطأ: ${errorInfo.type} - ${errorInfo.userMessage}`);
    
    // مسح الكاش وإعادة التحميل
    await clearAllCaches();
    window.location.reload();
  } else {
    sessionStorage.removeItem(CACHE_BUST_KEY);
    productionLogger.error('❌ فشل تحميل التطبيق بعد عدة محاولات');
    productionLogger.error(`📋 آخر خطأ: ${errorInfo.type} - ${errorInfo.message}`);
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

/**
 * تسجيل مستمعي الأخطاء العامة
 * يجب استدعاؤها في main.tsx
 */
export function registerChunkErrorHandlers(): void {
  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error)) {
      event.preventDefault();
      handleChunkLoadError(event.error);
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault();
      handleChunkLoadError(event.reason);
    }
  });
}
