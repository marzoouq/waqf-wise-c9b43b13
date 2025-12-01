/**
 * Hook لتنظيف التنبيهات القديمة تلقائياً
 * يستدعي cleanup_old_alerts() كل 6 ساعات
 */

import { useEffect, useRef } from 'react';
import { runFullCleanup } from '@/lib/cleanupAlerts';

const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 ساعات
const CLEANUP_KEY = 'last_alert_cleanup';

export function useAlertCleanup() {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const performCleanup = async () => {
      try {
        const lastCleanup = localStorage.getItem(CLEANUP_KEY);
        const now = Date.now();
        
        // التحقق من آخر تنظيف
        if (lastCleanup) {
          const lastCleanupTime = parseInt(lastCleanup, 10);
          if (now - lastCleanupTime < CLEANUP_INTERVAL) {
            // لم يحن وقت التنظيف بعد
            return;
          }
        }

        if (import.meta.env.DEV) {
          console.log('Starting automatic alert cleanup...');
        }
        
        const stats = await runFullCleanup();
        
        if (import.meta.env.DEV) {
          console.log('Alert cleanup completed', {
            deletedAlerts: stats.deletedAlerts,
            mergedDuplicates: stats.mergedDuplicates,
            trimmedActive: stats.trimmedActive,
            localStorageDeleted: stats.localStorageDeleted,
            errors: stats.errors.length,
          });
        }

        // حفظ وقت آخر تنظيف
        localStorage.setItem(CLEANUP_KEY, now.toString());
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Alert cleanup failed', error);
        }
      }
    };

    // تشغيل التنظيف عند التحميل
    performCleanup();

    // جدولة التنظيف الدوري
    intervalRef.current = setInterval(performCleanup, CLEANUP_INTERVAL);

    // تنظيف عند unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
