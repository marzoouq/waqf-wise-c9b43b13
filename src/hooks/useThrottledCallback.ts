import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook لتنظيم تنفيذ دالة (Throttling)
 * مفيد للأحداث المتكررة (scroll, resize)
 * 
 * @example
 * const throttledScroll = useThrottledCallback(
 *   (event) => handleScroll(event),
 *   200
 * );
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        // تنفيذ فوري
        callbackRef.current(...args);
        lastRunRef.current = now;
      } else {
        // جدولة التنفيذ
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRunRef.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [delay]
  );
}
