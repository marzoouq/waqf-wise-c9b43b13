/**
 * مراقب الخلفية - يعمل تلقائياً للكشف المبكر عن المشاكل
 * يحذر من المشاكل قبل أن تصبح حرجة
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { productionLogger } from '@/lib/logger/production-logger';

// حدود التحذير
const THRESHOLDS = {
  MEMORY_WARNING: 70,
  MEMORY_CRITICAL: 85,
  RENDER_PER_SECOND: 10,
  LONG_TASK_MS: 100,
  NETWORK_TIMEOUT_MS: 10000,
};

// تتبع التحذيرات لتجنب التكرار
const shownWarnings = new Set<string>();
const WARN_COOLDOWN_MS = 60000; // تحذير واحد كل دقيقة لكل نوع

export function BackgroundMonitor() {
  const { isAdmin, isNazer, isLoading } = useUserRole();
  const shouldMonitor = !isLoading && (isAdmin || isNazer);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!shouldMonitor) return;

    const showWarning = (key: string, message: string, severity: 'warning' | 'error' = 'warning') => {
      const now = Date.now();
      const lastShown = shownWarnings.has(key) ? parseInt(localStorage.getItem(`warn_${key}`) || '0') : 0;
      
      if (now - lastShown < WARN_COOLDOWN_MS) return;
      
      shownWarnings.add(key);
      localStorage.setItem(`warn_${key}`, now.toString());

      if (severity === 'error') {
        toast.error(message, { duration: 8000 });
        productionLogger.error(message);
      } else {
        toast.warning(message, { duration: 5000 });
        productionLogger.warn(message);
      }
    };

    // مراقبة الذاكرة
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

    // مراقبة Long Tasks
    let longTaskObserver: PerformanceObserver | null = null;
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > THRESHOLDS.LONG_TASK_MS) {
            showWarning('long_task', `🐌 مهمة بطيئة: ${entry.duration.toFixed(0)}ms`);
          }
        });
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      // غير مدعوم
    }

    // مراقبة Layout Shift المفرط
    let clsValue = 0;
    let clsObserver: PerformanceObserver | null = null;
    try {
      clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value: number }).value;
            if (clsValue > 0.25) {
              showWarning('cls_high', `📐 تحريك تخطيط مفرط: ${clsValue.toFixed(3)}`);
            }
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // غير مدعوم
    }

    // مراقبة الشبكة
    const checkNetwork = () => {
      if (!navigator.onLine) {
        showWarning('offline', '📡 لا يوجد اتصال بالإنترنت', 'error');
      }
    };

    window.addEventListener('offline', () => {
      showWarning('offline', '📡 انقطع الاتصال بالإنترنت', 'error');
    });

    window.addEventListener('online', () => {
      toast.success('✅ تم استعادة الاتصال بالإنترنت');
    });

    // بدء المراقبة الدورية
    checkMemory();
    checkNetwork();
    intervalRef.current = setInterval(() => {
      checkMemory();
    }, 30000); // كل 30 ثانية

    // تسجيل بدء المراقبة
    productionLogger.info('🔍 بدأت مراقبة الخلفية للكشف المبكر عن المشاكل');

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      longTaskObserver?.disconnect();
      clsObserver?.disconnect();
    };
  }, [shouldMonitor]);

  return null;
}
