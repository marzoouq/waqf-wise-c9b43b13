/**
 * Hook لمراقبة ظهور العناصر في viewport
 * يستخدم لـ Lazy Loading والتحميل المسبق
 * v2.9.33
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLDivElement>;
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook لمراقبة تقاطع العنصر مع viewport
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);

  const frozen = freezeOnceVisible && isIntersecting;

  useEffect(() => {
    const element = ref.current;
    
    if (!element || frozen || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, frozen]);

  return { ref, isIntersecting, entry };
}

/**
 * Hook لتحميل المكونات عند ظهورها
 */
export function useLazyLoad(options?: UseIntersectionObserverOptions) {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
    rootMargin: '100px', // تحميل مسبق قبل الظهور بـ 100px
  });

  return { ref, shouldLoad: isIntersecting };
}

export default useIntersectionObserver;
