/**
 * مكون إدارة الجلسة
 * يتعامل مع تنظيف الجلسات عند إغلاق التطبيق
 */

import { useEffect } from 'react';
import { useSessionCleanup, checkPendingCleanup } from '@/hooks/auth/useSessionCleanup';
import { useAuth } from '@/contexts/AuthContext';
import { productionLogger } from '@/lib/logger/production-logger';

export function SessionManager() {
  const { user, isLoading } = useAuth();
  const { updateLastActive } = useSessionCleanup();

  useEffect(() => {
    // لا تفعل شيء حتى يكتمل التحميل
    if (isLoading) return;
    
    // ✅ إصلاح: لا نتحقق من التنظيف إذا كان المستخدم مسجل دخول فعلاً
    if (user) {
      // إزالة علامة التنظيف المعلق إذا وجدت - المستخدم مسجل دخول
      localStorage.removeItem('waqf_session_cleanup_pending');
      return;
    }
    
    // التحقق من تنظيف معلق عند تحميل التطبيق (فقط إذا لا يوجد مستخدم)
    const checkAndCleanup = async () => {
      const hadCleanup = await checkPendingCleanup();
      if (hadCleanup) {
        productionLogger.info('Session cleaned up from previous visit');
      }
    };

    checkAndCleanup();
  }, [user, isLoading]);

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
