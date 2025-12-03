/**
 * مراقب الوقت الحقيقي للتطبيق
 * يتتبع كل الأحداث والتغييرات مباشرة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

export interface RealTimeEvent {
  id: string;
  type: 'click' | 'input' | 'navigation' | 'error' | 'network' | 'state' | 'render' | 'mutation';
  target: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface MonitorStats {
  totalEvents: number;
  eventsPerMinute: number;
  topTargets: { target: string; count: number }[];
  errorRate: number;
  avgResponseTime: number;
}

const MAX_EVENTS = 500;
const eventsBuffer: RealTimeEvent[] = [];
let eventListeners: ((events: RealTimeEvent[]) => void)[] = [];

// Throttle helper
function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

// تسجيل حدث (مع throttle ضمني)
let lastLogTime = 0;
const LOG_THROTTLE_MS = 100; // 100ms بين الأحداث

function logEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>) {
  const now = Date.now();
  
  // تجاهل الأحداث المتكررة بسرعة (إلا الأخطاء)
  if (event.type !== 'error' && now - lastLogTime < LOG_THROTTLE_MS) {
    return;
  }
  lastLogTime = now;
  
  const fullEvent: RealTimeEvent = {
    ...event,
    id: `${event.type}-${now}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  eventsBuffer.unshift(fullEvent);
  
  // الحفاظ على الحد الأقصى
  if (eventsBuffer.length > MAX_EVENTS) {
    eventsBuffer.pop();
  }
  
  // إشعار المستمعين (مع throttle)
  notifyListeners();
}

// Throttled notification
const notifyListeners = throttle(() => {
  eventListeners.forEach(listener => listener([...eventsBuffer]));
}, 500);

export function useRealTimeMonitor(enabled: boolean = true) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // الاستماع للتحديثات
  useEffect(() => {
    const listener = (newEvents: RealTimeEvent[]) => {
      setEvents(newEvents);
    };
    
    if (enabled) {
      eventListeners.push(listener);
      setEvents([...eventsBuffer]);
    }
    
    return () => {
      eventListeners = eventListeners.filter(l => l !== listener);
    };
  }, [enabled]);

  // بدء التسجيل
  const startRecording = useCallback(() => {
    if (!enabled || isRecording) return;
    setIsRecording(true);
    
    const cleanupFns: (() => void)[] = [];
    
    // 1. مراقبة النقرات (throttled)
    const clickHandler = throttle((e: MouseEvent) => {
      const target = e.target as HTMLElement;
      logEvent({
        type: 'click',
        target: getElementSelector(target),
        metadata: {
          tagName: target.tagName,
          id: target.id,
          text: target.textContent?.slice(0, 30),
        },
      });
    }, 200);
    document.addEventListener('click', clickHandler, true);
    cleanupFns.push(() => document.removeEventListener('click', clickHandler, true));

    // 2. مراقبة الإدخال (throttled)
    const inputHandler = throttle((e: Event) => {
      const target = e.target as HTMLInputElement;
      logEvent({
        type: 'input',
        target: getElementSelector(target),
        metadata: {
          tagName: target.tagName,
          inputType: target.type,
          name: target.name,
        },
      });
    }, 300);
    document.addEventListener('input', inputHandler, true);
    cleanupFns.push(() => document.removeEventListener('input', inputHandler, true));

    // 3. مراقبة الأخطاء
    const errorHandler = (e: ErrorEvent) => {
      logEvent({
        type: 'error',
        target: e.filename || 'unknown',
        metadata: {
          message: e.message,
          lineno: e.lineno,
        },
      });
    };
    window.addEventListener('error', errorHandler);
    cleanupFns.push(() => window.removeEventListener('error', errorHandler));

    // 4. مراقبة Promise rejections
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      logEvent({
        type: 'error',
        target: 'Promise Rejection',
        metadata: { reason: String(e.reason).slice(0, 100) },
      });
    };
    window.addEventListener('unhandledrejection', rejectionHandler);
    cleanupFns.push(() => window.removeEventListener('unhandledrejection', rejectionHandler));

    // 5. مراقبة التنقل
    const navigationHandler = () => {
      logEvent({
        type: 'navigation',
        target: window.location.pathname,
      });
    };
    window.addEventListener('popstate', navigationHandler);
    cleanupFns.push(() => window.removeEventListener('popstate', navigationHandler));

    // 6. مراقبة DOM mutations (محدودة جداً)
    let mutationCount = 0;
    const mutationHandler = throttle((mutations: MutationRecord[]) => {
      // تجاهل أكثر من 10 mutations في الثانية
      if (mutationCount > 10) return;
      mutationCount++;
      setTimeout(() => mutationCount--, 1000);
      
      const significantMutations = mutations.filter(m => 
        m.addedNodes.length > 0 && 
        (m.target as HTMLElement).tagName !== 'SCRIPT'
      );
      
      if (significantMutations.length > 0) {
        logEvent({
          type: 'mutation',
          target: getElementSelector(significantMutations[0].target as HTMLElement),
          metadata: { count: significantMutations.length },
        });
      }
    }, 500);
    
    observerRef.current = new MutationObserver(mutationHandler);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: false, // تقليل المراقبة - فقط المستوى الأول
    });
    cleanupFns.push(() => observerRef.current?.disconnect());

    // 7. اعتراض fetch (محدود)
    const originalFetch = window.fetch;
    let fetchCount = 0;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        // تسجيل فقط كل 5 طلبات لتقليل الضغط
        fetchCount++;
        if (fetchCount % 5 === 0 || duration > 1000) {
          logEvent({
            type: 'network',
            target: url.split('?')[0].slice(-50), // اختصار URL
            duration,
            metadata: { status: response.status },
          });
        }
        
        return response;
      } catch (error) {
        logEvent({
          type: 'error',
          target: 'Fetch Error',
          metadata: { url: url.slice(-50) },
        });
        throw error;
      }
    };
    cleanupFns.push(() => { window.fetch = originalFetch; });

    // حفظ cleanup functions
    cleanupRef.current = () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [enabled, isRecording]);

  // إيقاف التسجيل
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  // حساب الإحصائيات
  const calculateStats = useCallback((): MonitorStats => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentEvents = eventsBuffer.filter(e => e.timestamp.getTime() > oneMinuteAgo);
    
    // حساب الأهداف الأكثر شيوعاً
    const targetCounts: Record<string, number> = {};
    eventsBuffer.forEach(e => {
      targetCounts[e.target] = (targetCounts[e.target] || 0) + 1;
    });
    
    const topTargets = Object.entries(targetCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([target, count]) => ({ target, count }));
    
    // حساب معدل الأخطاء
    const errorEvents = eventsBuffer.filter(e => e.type === 'error');
    const errorRate = eventsBuffer.length > 0 ? (errorEvents.length / eventsBuffer.length) * 100 : 0;
    
    // حساب متوسط وقت الاستجابة
    const networkEvents = eventsBuffer.filter(e => e.type === 'network' && e.duration);
    const avgResponseTime = networkEvents.length > 0
      ? networkEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / networkEvents.length
      : 0;
    
    return {
      totalEvents: eventsBuffer.length,
      eventsPerMinute: recentEvents.length,
      topTargets,
      errorRate,
      avgResponseTime,
    };
  }, []);

  // تحديث الإحصائيات دورياً
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      setStats(calculateStats());
    }, 5000);
    
    setStats(calculateStats());
    
    return () => clearInterval(interval);
  }, [enabled, calculateStats]);

  // مسح الأحداث
  const clearEvents = useCallback(() => {
    eventsBuffer.length = 0;
    setEvents([]);
    setStats(null);
  }, []);

  // تصدير الأحداث
  const exportEvents = useCallback(() => {
    const data = JSON.stringify(eventsBuffer, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    events,
    stats,
    isRecording,
    startRecording,
    stopRecording,
    clearEvents,
    exportEvents,
  };
}

// دالة مساعدة للحصول على محدد العنصر
function getElementSelector(el: HTMLElement): string {
  if (!el) return 'unknown';
  
  let selector = el.tagName.toLowerCase();
  
  if (el.id) {
    selector += `#${el.id}`;
  } else if (el.className && typeof el.className === 'string') {
    const classes = el.className.split(' ').filter(c => c && !c.startsWith('__')).slice(0, 2);
    if (classes.length) {
      selector += `.${classes.join('.')}`;
    }
  }
  
  return selector;
}

// تصدير للاستخدام الخارجي
export function getAllEvents(): RealTimeEvent[] {
  return [...eventsBuffer];
}
