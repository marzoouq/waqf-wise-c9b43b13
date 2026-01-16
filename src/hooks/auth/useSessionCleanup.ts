/**
 * Hook لمسح الجلسة عند إغلاق التطبيق
 * يمنع تعارض الجلسات عند دخول مستخدم آخر
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_CLEANUP_KEY = 'waqf_session_cleanup_pending';
const LAST_ACTIVE_KEY = 'waqf_last_active_timestamp';

/**
 * تنظيف كامل للجلسة والبيانات المؤقتة
 * ✅ محسّن: تنظيف شامل يشمل caches و service workers
 */
export const cleanupSession = async (options?: { keepTheme?: boolean; scope?: 'local' | 'global' }) => {
  const keysToKeep = options?.keepTheme ? [
    'theme',
    'vite-ui-theme',
    'language',
    'i18nextLng',
  ] : [];

  // حفظ القيم التي نريد الاحتفاظ بها
  const savedValues: Record<string, string> = {};
  keysToKeep.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) savedValues[key] = value;
  });

  // تنظيف localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // تنظيف sessionStorage
  sessionStorage.clear();

  // استعادة القيم المحفوظة
  Object.entries(savedValues).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  // ✅ تنظيف caches و service workers
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Cache cleanup warning:', e);
    }
  }

  // تسجيل الخروج من Supabase
  try {
    await supabase.auth.signOut({ scope: options?.scope || 'global' });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('Session cleanup signOut error', { error: err });
    }
  }
};

/**
 * التحقق من وجود تنظيف معلق من جلسة سابقة
 * ✅ إصلاح: لا ننظف إذا كانت هناك جلسة نشطة فعلاً
 */
export const checkPendingCleanup = async () => {
  const pendingCleanup = localStorage.getItem(SESSION_CLEANUP_KEY);
  if (pendingCleanup === 'true') {
    localStorage.removeItem(SESSION_CLEANUP_KEY);
    
    // ✅ التحقق من وجود جلسة نشطة قبل التنظيف
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // لا ننظف إذا كانت هناك جلسة صالحة - فقط نزيل العلامة
        if (import.meta.env.DEV) {
          console.log('⚠️ [checkPendingCleanup] تجاهل التنظيف - يوجد جلسة نشطة');
        }
        return false;
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('خطأ في التحقق من الجلسة', err);
      }
    }
    
    await cleanupSession({ keepTheme: true });
    return true;
  }
  return false;
};

/**
 * Hook لإدارة تنظيف الجلسة
 */
export function useSessionCleanup() {
  const cleanupTriggered = useRef(false);

  // تحديث وقت آخر نشاط
  const updateLastActive = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  // معالج إغلاق الصفحة
  const handleBeforeUnload = useCallback(() => {
    // فقط تحديث وقت آخر نشاط - لا نضع علامة تنظيف عند التحديث
    updateLastActive();
  }, [updateLastActive]);

  // معالج تغيير حالة الرؤية
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      updateLastActive();
    }
  }, [updateLastActive]);

  // معالج pagehide للأجهزة المحمولة
  const handlePageHide = useCallback((event: PageTransitionEvent) => {
    if (event.persisted) {
      // الصفحة في bfcache، لا نفعل شيء
      return;
    }
    // فقط تحديث وقت آخر نشاط
    updateLastActive();
  }, [updateLastActive]);

  useEffect(() => {
    // التحقق من وجود تنظيف معلق عند بدء التطبيق
    const init = async () => {
      const hadPendingCleanup = await checkPendingCleanup();
      if (hadPendingCleanup && import.meta.env.DEV) {
        console.log('Cleaned up pending session from previous visit');
      }
    };
    
    init();

    // إضافة المستمعين
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // تحديث وقت آخر نشاط
    updateLastActive();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [handleBeforeUnload, handleVisibilityChange, handlePageHide, updateLastActive]);

  // دالة التنظيف اليدوي
  const forceCleanup = useCallback(async () => {
    if (cleanupTriggered.current) return;
    cleanupTriggered.current = true;
    
    await cleanupSession({ keepTheme: true });
    
    cleanupTriggered.current = false;
  }, []);

  return { forceCleanup, updateLastActive };
}

export default useSessionCleanup;
