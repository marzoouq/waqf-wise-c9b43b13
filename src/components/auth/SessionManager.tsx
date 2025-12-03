/**
 * مكون إدارة الجلسة
 * يتعامل مع تنظيف الجلسات عند إغلاق التطبيق
 */

import { useEffect } from 'react';
import { useSessionCleanup, checkPendingCleanup } from '@/hooks/useSessionCleanup';
import { useAuth } from '@/contexts/AuthContext';
import { productionLogger } from '@/lib/logger/production-logger';

export function SessionManager() {
  const { user, isLoading } = useAuth();
  const { updateLastActive } = useSessionCleanup();

  // انتظار اكتمال تهيئة Auth قبل أي عمليات
  if (isLoading) return null;

  useEffect(() => {
    // التحقق من تنظيف معلق عند تحميل التطبيق
    const checkAndCleanup = async () => {
      const hadCleanup = await checkPendingCleanup();
      if (hadCleanup && !user) {
        productionLogger.info('Session cleaned up from previous visit');
      }
    };

    checkAndCleanup();
  }, [user]);

  // تحديث وقت آخر نشاط عند التفاعل
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      updateLastActive();
    };

    // الاستماع لأحداث التفاعل
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, updateLastActive]);

  return null;
}

export default SessionManager;
