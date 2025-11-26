/**
 * LazyImage Component
 * مكون تحميل الصور الكسول محسّن لـ LCP
 * 
 * ميزات:
 * - Lazy loading باستخدام Intersection Observer
 * - دعم responsive images (srcset)
 * - تحسين LCP للصور المهمة
 * - دعم WebP و AVIF
 * - Progressive loading
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { 
  optimizeImageUrl, 
  generateSrcSet, 
  generateSizes,
  preloadImage
} from '@/lib/imageOptimization';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  placeholderColor?: string;
  rootMargin?: string;
  threshold?: number;
  priority?: boolean; // للصور المهمة (above the fold) - لا تستخدم lazy loading
  responsive?: boolean; // إنشاء srcset تلقائياً
  quality?: number; // جودة الصورة (1-100)
  sizes?: string; // sizes attribute للصور التفاعلية
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderColor = 'hsl(var(--muted))',
  rootMargin = '50px',
  threshold = 0.01,
  priority = false,
  responsive = true,
  quality = 85,
  sizes,
  width,
  height,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // الصور ذات الأولوية تُحمل فوراً
  const imgRef = useRef<HTMLImageElement>(null);

  // تحسين URL الصورة
  const optimizedSrc = optimizeImageUrl(src, { 
    quality,
    width: width as number | undefined,
    height: height as number | undefined,
    format: 'webp'
  });

  // إنشاء srcset للصور التفاعلية
  const srcSet = responsive ? generateSrcSet(src) : undefined;
  const sizesAttr = sizes || (responsive ? generateSizes() : undefined);

  // تحميل مسبق للصور ذات الأولوية
  useEffect(() => {
    if (priority) {
      preloadImage(optimizedSrc, { quality });
    }
  }, [priority, optimizedSrc, quality]);

  // Intersection Observer للصور غير المهمة
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold,
        rootMargin 
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority, threshold, rootMargin]);

  return (
    <img
      ref={imgRef}
      src={isInView ? optimizedSrc : ''}
      srcSet={isInView && srcSet ? srcSet : undefined}
      sizes={sizesAttr}
      alt={alt}
      width={width}
      height={height}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        backgroundColor: isLoaded ? 'transparent' : placeholderColor,
      }}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      data-priority={priority ? 'high' : 'low'}
      {...props}
    />
  );
}

/**
 * مكون صورة محسّن للصور الكبيرة (Hero images)
 * محسّن لـ LCP - يُحمل بأولوية عالية
 */
export function HeroImage({
  src,
  alt,
  className,
  width = 1920,
  height = 1080,
  ...props
}: Omit<LazyImageProps, 'placeholderColor' | 'rootMargin' | 'priority'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('w-full h-auto object-cover', className)}
      priority={true} // أولوية عالية لتحسين LCP
      responsive={true}
      quality={90}
      {...props}
    />
  );
}

/**
 * مكون صورة محسّن للصور المصغرة
 */
export function ThumbnailImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'placeholderColor' | 'rootMargin'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      rootMargin="25px"
      {...props}
    />
  );
}
