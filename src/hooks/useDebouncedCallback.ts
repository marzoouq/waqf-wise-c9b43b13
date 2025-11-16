import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook لتأخير تنفيذ دالة (Debouncing)
 * مفيد للبحث والفلترة
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (value: string) => performSearch(value),
 *   500
 * );
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // تحديث المرجع عند تغيير الدالة
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
