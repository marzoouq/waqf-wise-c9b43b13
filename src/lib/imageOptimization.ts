/**
 * خدمة تحسين الصور وتحسين LCP (Largest Contentful Paint)
 * 
 * تشمل:
 * - تحسين الأحجام والجودة
 * - دعم WebP و AVIF
 * - Responsive images
 * - تحسين LCP
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  priority?: boolean; // للصور المهمة (above the fold)
}

/**
 * تحقق من دعم المتصفح لـ WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * تحقق من دعم المتصفح لـ AVIF
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }
  return false;
}

/**
 * إنشاء srcset للصور التفاعلية
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map(width => `${optimizeImageUrl(baseUrl, { width })} ${width}w`)
    .join(', ');
}

/**
 * إنشاء sizes للصور التفاعلية
 */
export function generateSizes(
  breakpoints: { maxWidth: string; size: string }[] = [
    { maxWidth: '640px', size: '100vw' },
    { maxWidth: '768px', size: '100vw' },
    { maxWidth: '1024px', size: '100vw' },
    { maxWidth: '1280px', size: '100vw' },
  ]
): string {
  const sizesArray = breakpoints.map(
    bp => `(max-width: ${bp.maxWidth}) ${bp.size}`
  );
  sizesArray.push('100vw'); // القيمة الافتراضية
  return sizesArray.join(', ');
}

/**
 * تحسين URL الصورة
 * ملاحظة: يمكن دمجه مع خدمة CDN أو Cloudinary لتحسين فعلي
 */
export function optimizeImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  // إذا كانت الصورة من Supabase Storage
  if (url.includes('supabase')) {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
    } = options;

    const params = new URLSearchParams();
    
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', format);

    // Supabase يدعم تحويل الصور عبر API
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  // للصور الخارجية، إرجاع URL كما هو
  return url;
}

/**
 * حساب الأبعاد المثلى للصورة بناءً على viewport
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * تحميل مسبق للصور المهمة (preload)
 */
export function preloadImage(
  src: string,
  options: ImageOptimizationOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = reject;
    
    const optimizedSrc = optimizeImageUrl(src, options);
    img.src = optimizedSrc;
  });
}

/**
 * تحميل مسبق لعدة صور
 */
export async function preloadImages(
  urls: string[],
  options: ImageOptimizationOptions = {}
): Promise<void[]> {
  return Promise.all(urls.map(url => preloadImage(url, options)));
}

/**
 * ضغط صورة من base64
 */
export async function compressImage(
  base64: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // ضغط الصورة
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * الحصول على أبعاد الصورة
 */
export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * تحسين LCP عبر تحميل الصور المهمة مبكراً
 */
export function optimizeLCP() {
  if (typeof window === 'undefined') return;

  // إضافة link preload للصور المهمة
  const criticalImages = document.querySelectorAll<HTMLImageElement>(
    'img[data-priority="high"], img[fetchpriority="high"]'
  );

  criticalImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = img.src;
    
    if (img.srcset) {
      link.setAttribute('imagesrcset', img.srcset);
    }
    
    document.head.appendChild(link);
  });
}

/**
 * مراقبة LCP
 */
export function observeLCP(callback: (lcp: number) => void) {
  if (typeof window === 'undefined') return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry) {
        callback(lastEntry.renderTime || lastEntry.loadTime);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.warn('LCP observation not supported:', error);
  }
}

/**
 * تحسين جميع الصور في الصفحة
 */
export function optimizePageImages() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll<HTMLImageElement>('img:not([data-optimized])');

  images.forEach(img => {
    // إضافة lazy loading
    if (!img.loading) {
      img.loading = 'lazy';
    }

    // إضافة decoding async
    if (!img.decoding) {
      img.decoding = 'async';
    }

    // إضافة علامة للصور المحسنة
    img.dataset.optimized = 'true';
  });
}
