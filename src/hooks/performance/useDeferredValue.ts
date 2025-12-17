/**
 * Hook لتأجيل القيم الثقيلة حتى انتهاء التفاعلات العاجلة
 * يحسن استجابة واجهة المستخدم
 * v2.9.33
 */

import { useState, useEffect, useTransition, useDeferredValue as useReactDeferredValue } from 'react';

/**
 * Hook لتأجيل البحث حتى توقف المستخدم عن الكتابة
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook لتأجيل قيم البحث مع React 18 concurrent features
 */
export function useDeferredSearchValue(searchTerm: string) {
  const deferredValue = useReactDeferredValue(searchTerm);
  const isStale = searchTerm !== deferredValue;

  return { deferredValue, isStale };
}

/**
 * Hook لتنفيذ العمليات الثقيلة في الخلفية
 */
export function useBackgroundTask<T>(
  task: () => T | Promise<T>,
  dependencies: unknown[] = []
) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    startTransition(() => {
      Promise.resolve(task())
        .then(setResult)
        .catch(setError);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { result, error, isPending };
}

/**
 * Hook لتحميل البيانات عند الحاجة فقط
 */
export function useLazyData<T>(
  fetcher: () => Promise<T>,
  options: { immediate?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = async () => {
    if (hasLoaded) return data;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setHasLoaded(true);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.immediate]);

  return { data, isLoading, error, load, hasLoaded };
}

export default useDebouncedValue;
