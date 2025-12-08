/**
 * Hook لمؤشر صحة النظام المرئي
 * System Health Indicator Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry';

export type HealthIndicatorStatus = 'healthy' | 'degraded' | 'offline' | 'slow';

export interface HealthIndicatorDetails {
  database: 'ok' | 'error' | 'unknown';
  responseTime: number;
  networkOnline: boolean;
  lastError?: string;
}

const THRESHOLDS = {
  SLOW_RESPONSE_MS: 3000,
  CRITICAL_RESPONSE_MS: 8000,
  CHECK_INTERVAL_MS: 120000,
  INITIAL_DELAY_MS: 10000,
};

export function useSystemHealthIndicator() {
  const [status, setStatus] = useState<HealthIndicatorStatus>('healthy');
  const [details, setDetails] = useState<HealthIndicatorDetails>({
    database: 'unknown',
    responseTime: 0,
    networkOnline: true,
  });
  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);

  const checkHealth = useCallback(async () => {
    if (!mountedRef.current) return;
    
    if (!navigator.onLine) {
      setStatus('offline');
      setDetails(prev => ({ ...prev, networkOnline: false, database: 'unknown' }));
      return;
    }

    setIsChecking(true);
    const startTime = performance.now();

    try {
      const { error } = await retryWithBackoff(
        async () => {
          const result = await supabase
            .from('activities')
            .select('id')
            .limit(1)
            .maybeSingle();
          
          if (result.error) throw result.error;
          return result;
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          maxDelay: 2000,
          shouldRetry: isRetryableError
        }
      );

      const responseTime = Math.round(performance.now() - startTime);

      if (!mountedRef.current) return;

      if (error) {
        setStatus('degraded');
        setDetails({
          database: 'error',
          responseTime,
          networkOnline: true,
          lastError: error.message || 'خطأ في الاتصال بقاعدة البيانات',
        });
      } else if (responseTime > THRESHOLDS.CRITICAL_RESPONSE_MS) {
        setStatus('degraded');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
          lastError: `استجابة بطيئة جداً: ${responseTime}ms`,
        });
      } else if (responseTime > THRESHOLDS.SLOW_RESPONSE_MS) {
        setStatus('slow');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
        });
      } else {
        setStatus('healthy');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
        });
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setStatus('offline');
        setDetails({
          database: 'unknown',
          responseTime,
          networkOnline: false,
          lastError: 'فشل في الاتصال بالخادم',
        });
      } else {
        setStatus('degraded');
        setDetails({
          database: 'error',
          responseTime,
          networkOnline: true,
          lastError: errorMessage,
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initialTimeout = setTimeout(checkHealth, THRESHOLDS.INITIAL_DELAY_MS);
    const interval = setInterval(checkHealth, THRESHOLDS.CHECK_INTERVAL_MS);

    const handleOnline = () => {
      setDetails(prev => ({ ...prev, networkOnline: true }));
      checkHealth();
    };

    const handleOffline = () => {
      setStatus('offline');
      setDetails(prev => ({ ...prev, networkOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  return {
    status,
    details,
    isChecking,
    thresholds: THRESHOLDS,
    checkHealth,
  };
}
