/**
 * تنظيف Service Workers القديمة
 * يُستخدم عندما يكون sw.js غير متاح على الخادم
 */

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
      console.log('🗑️ تم إلغاء تسجيل Service Worker:', registration.scope);
    }
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إلغاء تسجيل Service Workers:', error);
    return false;
  }
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
      console.log('⚠️ ملف sw.js غير متاح (HTTP', response.status, ')');
      await unregisterAllServiceWorkers();
    }
  } catch (error) {
    // خطأ في الشبكة أو الملف غير موجود
    console.log('⚠️ لا يمكن الوصول لـ sw.js، جارِ التنظيف...');
    await unregisterAllServiceWorkers();
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
    error.message?.includes('Failed to update');
  
  if (isNotFoundError) {
    console.log('🔧 خطأ "Not found" في SW، جارِ التنظيف...');
    const cleaned = await unregisterAllServiceWorkers();
    return cleaned;
  }
  
  return false;
}
