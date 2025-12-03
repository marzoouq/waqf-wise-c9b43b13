/**
 * مراقب الخلفية - يعمل تلقائياً للكشف المبكر عن المشاكل
 * يحذر من المشاكل قبل أن تصبح حرجة
 * محسّن لتجنب التكرار مع usePerformanceGuard
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { productionLogger } from '@/lib/logger/production-logger';

// حدود التحذير - مرفوعة لتقليل الضوضاء
const THRESHOLDS = {
  MEMORY_WARNING: 75,
  MEMORY_CRITICAL: 90,
  LONG_TASK_MS: 200, // مرفوع من 100 لتقليل التنبيهات
};

// تتبع التحذيرات لتجنب التكرار
const shownWarnings = new Map<string, number>();
const WARN_COOLDOWN_MS = 120000; // تحذير واحد كل دقيقتين لكل نوع

export function BackgroundMonitor() {
  const { isAdmin, isNazer, isLoading } = useUserRole();
  const shouldMonitor = !isLoading && (isAdmin || isNazer);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!shouldMonitor) return;

    const showWarning = (key: string, message: string, severity: 'warning' | 'error' = 'warning') => {
      const now = Date.now();
      const lastShown = shownWarnings.get(key) || 0;
      
      if (now - lastShown < WARN_COOLDOWN_MS) return;
      
      shownWarnings.set(key, now);

      if (severity === 'error') {
        toast.error(message, { duration: 8000 });
        productionLogger.error(message);
      } else {
        toast.warning(message, { duration: 5000 });
        productionLogger.warn(message);
      }
    };

    // مراقبة الذاكرة فقط (Long Tasks يراقبها usePerformanceGuard)
    const checkMemory = () => {
      if (!('memory' in performance)) return;

      const memory = (performance as Performance & { memory: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      }}).memory;

      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      if (usage > THRESHOLDS.MEMORY_CRITICAL) {
        showWarning('memory_critical', `⛔ استخدام الذاكرة حرج: ${usage.toFixed(1)}%`, 'error');
      } else if (usage > THRESHOLDS.MEMORY_WARNING) {
        showWarning('memory_warning', `⚠️ استخدام الذاكرة مرتفع: ${usage.toFixed(1)}%`);
      }
    };

    // مراقبة الشبكة
    const handleOffline = () => {
      showWarning('offline', '📡 انقطع الاتصال بالإنترنت', 'error');
    };
    
    const handleOnline = () => {
      toast.success('✅ تم استعادة الاتصال بالإنترنت');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // بدء المراقبة الدورية - كل 60 ثانية بدلاً من 30
    const timeoutId = setTimeout(() => {
      checkMemory();
      intervalRef.current = setInterval(checkMemory, 60000);
    }, 5000); // تأخير 5 ثوان قبل البدء

    // تسجيل بدء المراقبة
    productionLogger.info('🔍 بدأت مراقبة الخلفية للكشف المبكر عن المشاكل');

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [shouldMonitor]);

  return null;
}
