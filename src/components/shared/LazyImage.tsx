/**
 * LazyImage Component
 * مكون الصور مع التحميل الكسول والـ Intersection Observer
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * مكون صورة محسّن مع:
 * - Lazy loading باستخدام Intersection Observer
 * - Progressive loading مع placeholder
 * - Fade-in animation
 */
export function LazyImage({
  src,
  alt,
  className,
  placeholderSrc = '/placeholder.svg',
  threshold = 0.01,
  rootMargin = '50px',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

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
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView && currentSrc !== src) {
      setCurrentSrc(src);
    }
  }, [isInView, src, currentSrc]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-50',
        className
      )}
      loading="lazy"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}

/**
 * مكون صورة محسّن للصور الكبيرة (Hero images)
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'placeholderSrc'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('w-full h-auto object-cover', className)}
      rootMargin="100px" // تحميل مسبق أكبر للصور الكبيرة
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
}: Omit<LazyImageProps, 'placeholderSrc'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      rootMargin="25px" // تحميل أقرب للصور المصغرة
      {...props}
    />
  );
}
