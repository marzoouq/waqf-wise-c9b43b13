/**
 * useConnectionMonitor Hook
 * خطاف مراقبة الاتصال
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  connectionMonitor, 
  ConnectionEvent, 
  ConnectionStats 
} from '@/services/monitoring/connection-monitor.service';

export function useConnectionMonitor() {
  const [events, setEvents] = useState<ConnectionEvent[]>([]);
  const [stats, setStats] = useState<ConnectionStats>(connectionMonitor.getStats());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // تحميل الأحداث الحالية
    setEvents(connectionMonitor.getEvents());

    // الاشتراك في الأحداث الجديدة
    const unsubscribeEvents = connectionMonitor.subscribe((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
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
    connectionMonitor.logApiError(url, status, message);
  }, []);

  const logDatabaseError = useCallback((operation: string, error: string) => {
    connectionMonitor.logDatabaseError(operation, error);
  }, []);

  return {
    events,
    stats,
    isOnline,
    clearEvents,
    logApiError,
    logDatabaseError,
  };
}

export type { ConnectionEvent, ConnectionStats };
