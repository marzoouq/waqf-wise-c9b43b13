import { memo, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * مكون لتحسين الأداء بشكل عام
 * يوفر أدوات للتحميل الكسول والتخزين المؤقت
 */

// مكون تحميل افتراضي
const DefaultLoadingFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

/**
 * دالة مساعدة للتحميل الكسول مع Suspense
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <DefaultLoadingFallback />
) {
  const LazyComponent = lazy(importFunc);

  return memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  ));
}

/**
 * مكون للتحسين التلقائي للصور
 */
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '',
  priority = false 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  priority?: boolean;
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * HOC لتحسين أداء المكونات الكبيرة
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) {
  const MemoizedComponent = memo(Component);
  MemoizedComponent.displayName = displayName || Component.displayName || 'OptimizedComponent';
  return MemoizedComponent;
}
