/**
 * مكون للتحميل الكسول مع placeholder
 * يحسن أداء الصفحات الطويلة
 * v2.9.33
 */

import { ReactNode } from 'react';
import { useLazyLoad } from '@/hooks/performance/useIntersectionObserver';

interface LazyLoadWrapperProps {
  children: ReactNode;
  placeholder?: ReactNode;
  height?: number | string;
  className?: string;
}

/**
 * غلاف للتحميل الكسول - يحمّل المحتوى فقط عند ظهوره
 */
export function LazyLoadWrapper({
  children,
  placeholder,
  height = 200,
  className,
}: LazyLoadWrapperProps) {
  const { ref, shouldLoad } = useLazyLoad();

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: shouldLoad ? 'auto' : height }}
    >
      {shouldLoad ? (
        children
      ) : (
        placeholder || (
          <div 
            className="flex items-center justify-center bg-muted/20 rounded-lg animate-pulse"
            style={{ height }}
          >
            <span className="text-muted-foreground text-sm">جاري التحميل...</span>
          </div>
        )
      )}
    </div>
  );
}

export default LazyLoadWrapper;
