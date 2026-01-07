/**
 * useConnectionMonitor Hook
 * خطاف مراقبة الاتصال مع حماية Rate Limiting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  connectionMonitor, 
  ConnectionEvent, 
  ConnectionStats 
} from '@/services/monitoring/connection-monitor.service';

// أسباب انقطاع الاتصال الشائعة
export const DISCONNECTION_CAUSES = {
  RATE_LIMITING: {
    code: 'RATE_LIMIT',
    message: 'طلبات كثيرة جداً - تم تجاوز الحد المسموح',
    solution: 'انتظر 30 ثانية ثم حاول مجدداً',
  },
  NETWORK_TIMEOUT: {
    code: 'TIMEOUT',
    message: 'انتهت مهلة الاتصال',
    solution: 'تحقق من سرعة الإنترنت',
  },
  SERVER_OVERLOAD: {
    code: 'SERVER_503',
    message: 'الخادم مشغول جداً',
    solution: 'انتظر دقيقة ثم حاول مجدداً',
  },
  MEMORY_EXHAUSTION: {
    code: 'MEMORY',
    message: 'استنزاف ذاكرة المتصفح',
    solution: 'قلل عدد الاختبارات المتزامنة',
  },
  CONNECTION_POOL: {
    code: 'POOL_EXHAUSTED',
    message: 'استنفاد مجموعة الاتصالات',
    solution: 'أعد تحميل الصفحة',
  },
};

export function useConnectionMonitor() {
  const [events, setEvents] = useState<ConnectionEvent[]>([]);
  const [stats, setStats] = useState<ConnectionStats>(connectionMonitor.getStats());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const requestCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());

  // مراقبة Rate Limiting
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastResetRef.current;
    
    // إعادة ضبط العداد كل دقيقة
    if (elapsed > 60000) {
      requestCountRef.current = 0;
      lastResetRef.current = now;
      setRateLimitWarning(false);
    }
    
    requestCountRef.current++;
    
    // تحذير عند اقتراب من الحد (100 طلب/دقيقة)
    if (requestCountRef.current > 80) {
      setRateLimitWarning(true);
      connectionMonitor.logEvent({
        type: 'api',
        status: 'slow',
        message: 'تحذير: اقتراب من حد الطلبات',
        details: `${requestCountRef.current} طلب في آخر دقيقة`,
      });
    }
    
    return requestCountRef.current > 100;
  }, []);

  useEffect(() => {
    // تحميل الأحداث الحالية
    setEvents(connectionMonitor.getEvents());

    // الاشتراك في الأحداث الجديدة
    const unsubscribeEvents = connectionMonitor.subscribe((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
      
      // كشف Rate Limiting من الأخطاء
      if (event.errorCode === '429') {
        setRateLimitWarning(true);
      }
    });

    // الاشتراك في تحديثات الإحصائيات
    const unsubscribeStats = connectionMonitor.subscribeToStats((newStats) => {
      setStats(newStats);
      setIsOnline(newStats.currentStatus !== 'offline');
    });

    // مراقبة حالة الاتصال
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeEvents();
      unsubscribeStats();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearEvents = useCallback(() => {
    connectionMonitor.clearEvents();
    setEvents([]);
  }, []);

  const logApiError = useCallback((url: string, status: number, message: string) => {
    checkRateLimit();
    connectionMonitor.logApiError(url, status, message);
  }, [checkRateLimit]);

  const logDatabaseError = useCallback((operation: string, error: string) => {
    connectionMonitor.logDatabaseError(operation, error);
  }, []);

  const getDisconnectionCause = useCallback((errorCode?: string): typeof DISCONNECTION_CAUSES[keyof typeof DISCONNECTION_CAUSES] | null => {
    if (errorCode === '429') return DISCONNECTION_CAUSES.RATE_LIMITING;
    if (errorCode === '408' || errorCode === '0') return DISCONNECTION_CAUSES.NETWORK_TIMEOUT;
    if (errorCode === '503') return DISCONNECTION_CAUSES.SERVER_OVERLOAD;
    return null;
  }, []);

  return {
    events,
    stats,
    isOnline,
    rateLimitWarning,
    clearEvents,
    logApiError,
    logDatabaseError,
    checkRateLimit,
    getDisconnectionCause,
    requestCount: requestCountRef.current,
    DISCONNECTION_CAUSES,
  };
}

export type { ConnectionEvent, ConnectionStats };
