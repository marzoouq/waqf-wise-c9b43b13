/**
 * Hook لتتبع وتسجيل أخطاء تحميل الـ Chunks
 * Chunk Error Tracking Hook
 */

import { useEffect, useCallback } from 'react';
import { 
  isChunkLoadError, 
  getChunkErrorInfo, 
  logChunkError,
  getChunkErrorLogs,
  clearChunkErrorLogs,
  type ChunkErrorInfo 
} from '@/lib/errors/chunk-error-handler';

const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

interface ChunkErrorStats {
  totalErrors: number;
  lastError: string | null;
  errorTypes: Record<string, number>;
  shouldEscalate: boolean;
}

/**
 * Hook لتتبع أخطاء الـ Chunks على مستوى التطبيق
 */
export function useChunkErrorTracking() {
  // Track errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) {
        logChunkError(event.error, { action: 'initial' });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        logChunkError(event.reason, { action: 'initial' });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  /**
   * الحصول على إحصائيات الأخطاء
   */
  const getErrorStats = useCallback((): ChunkErrorStats => {
    const logs = getChunkErrorLogs();
    const now = Date.now();
    
    // Filter to recent errors only
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return now - logTime < FAILURE_WINDOW_MS;
    });

    const errorTypes: Record<string, number> = {};
    recentLogs.forEach(log => {
      errorTypes[log.type] = (errorTypes[log.type] || 0) + 1;
    });

    return {
      totalErrors: recentLogs.length,
      lastError: recentLogs[recentLogs.length - 1]?.timestamp || null,
      errorTypes,
      shouldEscalate: recentLogs.length >= FAILURE_THRESHOLD
    };
  }, []);

  /**
   * تسجيل خطأ يدوياً
   */
  const trackError = useCallback((
    error: unknown,
    context?: { component?: string; attempt?: number }
  ): ChunkErrorInfo | null => {
    if (!isChunkLoadError(error)) return null;
    
    logChunkError(error, { ...context, action: 'initial' });
    return getChunkErrorInfo(error);
  }, []);

  /**
   * فحص إذا كان يجب التصعيد للدعم الفني
   */
  const shouldEscalate = useCallback((): boolean => {
    return getErrorStats().shouldEscalate;
  }, [getErrorStats]);

  /**
   * مسح سجل الأخطاء
   */
  const clearErrors = useCallback(() => {
    clearChunkErrorLogs();
  }, []);

  return {
    trackError,
    getErrorStats,
    shouldEscalate,
    clearErrors,
    isChunkLoadError,
    getChunkErrorInfo
  };
}

export default useChunkErrorTracking;
