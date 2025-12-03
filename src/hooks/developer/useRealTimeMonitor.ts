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

// تسجيل حدث
function logEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>) {
  const fullEvent: RealTimeEvent = {
    ...event,
    id: `${event.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  eventsBuffer.unshift(fullEvent);
  
  // الحفاظ على الحد الأقصى
  if (eventsBuffer.length > MAX_EVENTS) {
    eventsBuffer.pop();
  }
  
  // إشعار المستمعين
  eventListeners.forEach(listener => listener([...eventsBuffer]));
}

export function useRealTimeMonitor(enabled: boolean = true) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const networkObserverRef = useRef<PerformanceObserver | null>(null);

  // الاستماع للتحديثات
  useEffect(() => {
    if (!enabled) return;
    
    const listener = (newEvents: RealTimeEvent[]) => {
      setEvents(newEvents);
    };
    
    eventListeners.push(listener);
    setEvents([...eventsBuffer]);
    
    return () => {
      eventListeners = eventListeners.filter(l => l !== listener);
    };
  }, [enabled]);

  // بدء التسجيل
  const startRecording = useCallback(() => {
    if (!enabled || isRecording) return;
    setIsRecording(true);
    
    // 1. مراقبة النقرات
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      logEvent({
        type: 'click',
        target: getElementSelector(target),
        metadata: {
          tagName: target.tagName,
          id: target.id,
          className: target.className,
          text: target.textContent?.slice(0, 50),
        },
      });
    };
    document.addEventListener('click', clickHandler, true);

    // 2. مراقبة الإدخال
    const inputHandler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      logEvent({
        type: 'input',
        target: getElementSelector(target),
        metadata: {
          tagName: target.tagName,
          inputType: target.type,
          name: target.name,
          hasValue: !!target.value,
        },
      });
    };
    document.addEventListener('input', inputHandler, true);

    // 3. مراقبة الأخطاء
    const errorHandler = (e: ErrorEvent) => {
      logEvent({
        type: 'error',
        target: e.filename || 'unknown',
        metadata: {
          message: e.message,
          lineno: e.lineno,
          colno: e.colno,
        },
      });
    };
    window.addEventListener('error', errorHandler);

    // 4. مراقبة Promise rejections
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      logEvent({
        type: 'error',
        target: 'Promise Rejection',
        metadata: {
          reason: String(e.reason),
        },
      });
    };
    window.addEventListener('unhandledrejection', rejectionHandler);

    // 5. مراقبة التنقل
    const navigationHandler = () => {
      logEvent({
        type: 'navigation',
        target: window.location.pathname,
        metadata: {
          search: window.location.search,
          hash: window.location.hash,
        },
      });
    };
    window.addEventListener('popstate', navigationHandler);

    // 6. مراقبة DOM mutations
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          logEvent({
            type: 'mutation',
            target: getElementSelector(mutation.target as HTMLElement),
            metadata: {
              addedNodes: mutation.addedNodes.length,
              removedNodes: mutation.removedNodes.length,
            },
          });
        }
      });
    });
    
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 7. مراقبة طلبات الشبكة
    try {
      networkObserverRef.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            logEvent({
              type: 'network',
              target: resourceEntry.name,
              duration: resourceEntry.duration,
              metadata: {
                initiatorType: resourceEntry.initiatorType,
                transferSize: resourceEntry.transferSize,
                encodedBodySize: resourceEntry.encodedBodySize,
              },
            });
          }
        });
      });
      
      networkObserverRef.current.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // بعض المتصفحات لا تدعم resource
    }

    // 8. اعتراض fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        logEvent({
          type: 'network',
          target: url,
          duration,
          metadata: {
            method: typeof args[1]?.method === 'string' ? args[1].method : 'GET',
            status: response.status,
            ok: response.ok,
          },
        });
        
        return response;
      } catch (error) {
        logEvent({
          type: 'error',
          target: url,
          metadata: {
            error: String(error),
            type: 'fetch',
          },
        });
        throw error;
      }
    };

    // تنظيف عند الإيقاف
    return () => {
      document.removeEventListener('click', clickHandler, true);
      document.removeEventListener('input', inputHandler, true);
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('popstate', navigationHandler);
      observerRef.current?.disconnect();
      networkObserverRef.current?.disconnect();
      window.fetch = originalFetch;
    };
  }, [enabled, isRecording]);

  // إيقاف التسجيل
  const stopRecording = useCallback(() => {
    setIsRecording(false);
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
