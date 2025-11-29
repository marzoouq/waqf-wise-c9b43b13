/**
 * وظائف تنظيف الذاكرة المؤقتة و Service Workers
 */

import { productionLogger } from '@/lib/logger/production-logger';

/**
 * مسح جميع الـ caches و Service Workers
 */
export async function clearAllCaches(): Promise<void> {
  try {
    // مسح جميع الـ caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      productionLogger.info(`🗑️ تم مسح ${cacheNames.length} cache`);
    }
    
    // إلغاء تسجيل جميع Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      productionLogger.info(`🗑️ تم إلغاء تسجيل ${registrations.length} service worker`);
    }
  } catch (error) {
    productionLogger.error('خطأ في مسح الـ caches:', error);
    throw error;
  }
}

/**
 * تحديث إجباري للصفحة بعد مسح جميع الـ caches
 */
export async function forceRefresh(): Promise<void> {
  try {
    await clearAllCaches();
    // إعادة تحميل الصفحة بشكل كامل (تجاهل الـ cache)
    window.location.reload();
  } catch (error) {
    productionLogger.error('خطأ في التحديث الإجباري:', error);
    // إعادة التحميل حتى لو فشل المسح
    window.location.reload();
  }
}

/**
 * مسح الـ caches القديمة فقط (تحتوي على workbox أو cache في الاسم)
 */
export async function clearOldCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('workbox') || 
        name.includes('cache') ||
        name.includes('precache')
      );
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      );
      
      if (oldCaches.length > 0) {
        productionLogger.info(`🗑️ تم مسح ${oldCaches.length} cache قديم`);
      }
    } catch (error) {
      productionLogger.error('خطأ في مسح الـ caches القديمة:', error);
    }
  }
}

/**
 * تنظيف ذكي - يحافظ على بيانات المستخدم الأساسية
 */
export async function smartCacheClear(): Promise<void> {
  const keysToPreserve = [
    'waqf_app_version',
    'theme',
    'vite-ui-theme',
    'language',
    'i18nextLng',
  ];
  
  // حفظ البيانات المهمة
  const preserved: Record<string, string | null> = {};
  keysToPreserve.forEach(key => {
    preserved[key] = localStorage.getItem(key);
  });
  
  // تنظيف كل شيء
  await clearAllCaches();
  localStorage.clear();
  sessionStorage.clear();
  
  // استعادة البيانات المهمة
  Object.entries(preserved).forEach(([key, value]) => {
    if (value) localStorage.setItem(key, value);
  });
  
  productionLogger.info('✅ تم التنظيف الذكي مع الحفاظ على الإعدادات');
}
