import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  onIdle: () => void;
  idleTime: number; // بالميلي ثانية
  enabled: boolean;
}

/**
 * Hook لمراقبة خمول المستخدم وتنفيذ إجراء عند انتهاء المهلة
 * يتتبع أحداث: click, mousemove, keypress, scroll, touchstart
 */
export function useIdleTimeout({ onIdle, idleTime, enabled }: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // إعادة تعيين المؤقت
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    // مسح المؤقت السابق
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // إنشاء مؤقت جديد
    timeoutRef.current = setTimeout(() => {
      onIdle();
    }, idleTime);
  }, [enabled, idleTime, onIdle]);

  // معالج الأحداث
  const handleActivity = useCallback(() => {
    if (!enabled) return;
    resetTimer();
  }, [enabled, resetTimer]);

  useEffect(() => {
    if (!enabled) {
      // تنظيف المؤقت إذا تم تعطيل الميزة
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // ✅ إصلاح: تأخير بدء المؤقت 3 ثواني لضمان استقرار الجلسة والأدوار
    // هذا يمنع race condition مع تحميل الأدوار
    const startDelay = setTimeout(() => {
      // بدء المؤقت بعد التأخير
      resetTimer();
    }, 3000);

    // الأحداث التي تدل على نشاط المستخدم
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // إضافة المستمعين
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // التنظيف
    return () => {
      clearTimeout(startDelay);
      
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, handleActivity, resetTimer, idleTime]);

  // إرجاع دالة لإعادة تعيين المؤقت يدوياً إذا لزم الأمر
  return { resetTimer };
}
