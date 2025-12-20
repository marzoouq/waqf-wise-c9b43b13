/**
 * Hook لاستدعاء Edge Functions مع:
 * - منع memory leaks عند unmount
 * - timeout تلقائي
 * - إلغاء الطلبات المكررة
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

interface UseAbortableEdgeFunctionOptions {
  /** timeout بالميلي ثانية (افتراضي: 30 ثانية) */
  timeout?: number;
  /** callback عند انتهاء المهلة */
  onTimeout?: () => void;
  /** callback عند حدوث خطأ */
  onError?: (error: Error) => void;
}

interface EdgeFunctionState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isAborted: boolean;
}

export function useAbortableEdgeFunction<T = unknown>(
  functionName: string,
  options: UseAbortableEdgeFunctionOptions = {}
) {
  const { timeout = 30000, onTimeout, onError } = options;
  const mountedRef = useRef(true);
  const currentRequestRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<EdgeFunctionState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isAborted: false,
  });

  // تتبع حالة mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // تنظيف timeout عند unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const invoke = useCallback(
    async (body: Record<string, unknown> = {}): Promise<T | null> => {
      // إلغاء أي طلب سابق بزيادة request ID
      const requestId = ++currentRequestRef.current;

      // تنظيف timeout سابق
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!mountedRef.current) return null;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isAborted: false,
      }));

      // إعداد timeout
      timeoutRef.current = setTimeout(() => {
        if (requestId === currentRequestRef.current && mountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isAborted: true,
            error: 'انتهت مهلة الطلب',
          }));
          onTimeout?.();
          productionLogger.warn(
            `Edge function ${functionName} timed out after ${timeout}ms`
          );
        }
      }, timeout);

      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body,
        });

        // تنظيف timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // تجاهل النتيجة إذا:
        // 1. الـ component غير mounted
        // 2. هذا ليس آخر طلب (تم إلغاؤه)
        if (!mountedRef.current || requestId !== currentRequestRef.current) {
          return null;
        }

        if (error) {
          const errorMessage = error.message || 'حدث خطأ غير متوقع';
          setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
          onError?.(new Error(errorMessage));
          return null;
        }

        setState({
          data: data as T,
          error: null,
          isLoading: false,
          isAborted: false,
        });
        return data as T;
      } catch (err) {
        // تنظيف timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (mountedRef.current && requestId === currentRequestRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
          setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
        return null;
      }
    },
    [functionName, timeout, onTimeout, onError]
  );

  const cancel = useCallback(() => {
    // إلغاء بزيادة request ID
    currentRequestRef.current++;
    
    // تنظيف timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isAborted: true,
    }));
  }, []);

  const reset = useCallback(() => {
    // تنظيف timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState({
      data: null,
      error: null,
      isLoading: false,
      isAborted: false,
    });
  }, []);

  return {
    ...state,
    invoke,
    cancel,
    reset,
  };
}
