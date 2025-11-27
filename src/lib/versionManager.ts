import { productionLogger } from '@/lib/logger/production-logger';

const VERSION_KEY = 'app_version';

/**
 * نظام إدارة الإصدارات
 * يتحقق من الإصدار المخزن ويجبر التحديث عند اكتشاف إصدار جديد
 */
export async function checkAndForceUpdate(): Promise<boolean> {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const currentVersion = import.meta.env.VITE_APP_VERSION;

  if (storedVersion !== currentVersion) {
    productionLogger.info(`🔄 إصدار جديد: ${storedVersion} → ${currentVersion}`);

    // 1. مسح جميع الـ caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((c) => caches.delete(c)));
    }

    // 2. إلغاء تسجيل جميع Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }

    // 3. حفظ الإصدار الجديد
    localStorage.setItem(VERSION_KEY, currentVersion);

    // 4. إعادة تحميل الصفحة فوراً
    window.location.reload();
    return true;
  }
  return false;
}
