/**
 * تنظيف Service Workers و Workbox Caches
 * حل شامل لأخطاء workbox-*.js
 */

/**
 * قائمة أسماء caches التي يجب حذفها
 */
const WORKBOX_CACHE_PATTERNS = [
  'workbox-',
  'precache',
  'runtime-',
  'sw-',
  'waqf-',
  'cache-',
];

/**
 * إلغاء تسجيل جميع Service Workers
 */
export async function unregisterAllServiceWorkers(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      return false;
    }
    
    for (const registration of registrations) {
      await registration.unregister();
      if (import.meta.env.DEV) {
        console.log('🗑️ تم إلغاء تسجيل Service Worker:', registration.scope);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إلغاء تسجيل Service Workers:', error);
    return false;
  }
}

/**
 * حذف جميع caches المتعلقة بـ Workbox و Service Workers
 */
export async function clearAllWorkboxCaches(): Promise<number> {
  if (!('caches' in window)) return 0;
  
  try {
    const cacheNames = await caches.keys();
    let deletedCount = 0;
    
    for (const cacheName of cacheNames) {
      const shouldDelete = WORKBOX_CACHE_PATTERNS.some(pattern => 
        cacheName.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (shouldDelete) {
        await caches.delete(cacheName);
        if (import.meta.env.DEV) {
          console.log('🗑️ تم حذف cache:', cacheName);
        }
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('❌ خطأ في حذف caches:', error);
    return 0;
  }
}

/**
 * تنظيف شامل لـ Service Workers و Caches
 */
export async function fullServiceWorkerCleanup(): Promise<{
  swUnregistered: boolean;
  cachesDeleted: number;
}> {
  const swUnregistered = await unregisterAllServiceWorkers();
  const cachesDeleted = await clearAllWorkboxCaches();
  
  return { swUnregistered, cachesDeleted };
}

/**
 * فحص توفر ملف sw.js وتنظيف SWs القديمة إذا لم يكن متاحاً
 */
export async function cleanupOldServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    // فحص توفر sw.js
    const response = await fetch('/sw.js', { 
      method: 'HEAD', 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.log('⚠️ ملف sw.js غير متاح (HTTP', response.status, ')');
      }
      await fullServiceWorkerCleanup();
    }
  } catch {
    // خطأ في الشبكة أو الملف غير موجود - تنظيف كامل
    if (import.meta.env.DEV) {
      console.log('⚠️ لا يمكن الوصول لـ sw.js، جارِ التنظيف الشامل...');
    }
    await fullServiceWorkerCleanup();
  }
}

/**
 * معالجة خطأ تسجيل Service Worker
 * @returns true إذا تم معالجة الخطأ بنجاح
 */
export async function handleSWRegistrationError(error: Error): Promise<boolean> {
  const isNotFoundError = 
    error.message?.includes('Not found') || 
    error.message?.includes('404') ||
    error.message?.includes('Failed to update') ||
    error.message?.includes('workbox') ||
    error.message?.includes('Failed to fetch');
  
  if (isNotFoundError) {
    if (import.meta.env.DEV) {
      console.log('🔧 خطأ في SW، جارِ التنظيف الشامل...');
    }
    const result = await fullServiceWorkerCleanup();
    return result.swUnregistered || result.cachesDeleted > 0;
  }
  
  return false;
}
