/**
 * Hook مخصص لتحسين الأداء
 * يوفر أدوات مختلفة لتحسين أداء التطبيق
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * نوع عام للدوال
 */
type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Hook لتتبع أداء العرض
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (renderTime > 16) { // أكثر من 16ms (60fps)
      console.warn(
        `⚠️ Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms`,
        `(render #${renderCount.current})`
      );
    }

    startTime.current = performance.now();
  });

  return renderCount.current;
}

/**
 * Hook لتحسين callback functions
 */
export function useOptimizedCallback<T extends AnyFunction>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Hook لتحسين القيم المحسوبة
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Hook للتحكم في معدل استدعاء الدوال (Throttle)
 */
export function useThrottle<T extends AnyFunction>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook للتحكم في معدل استدعاء الدوال (Debounce)
 */
export function useDebounce<T extends AnyFunction>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook لتتبع الحجم المرئي للعنصر (Intersection Observer)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
