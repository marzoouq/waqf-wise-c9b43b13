/**
 * Hook لتحسين الصور وتحسين LCP
 */

import { useEffect, useState } from 'react';
import { 
  observeLCP, 
  optimizePageImages,
  preloadImages 
} from '@/lib/imageOptimization';

export function useImageOptimization() {
  const [lcp, setLcp] = useState<number | null>(null);

  useEffect(() => {
    // تحسين جميع الصور في الصفحة
    optimizePageImages();

    // مراقبة LCP
    observeLCP((lcpValue) => {
      setLcp(lcpValue);
      
      // تسجيل في console للتطوير
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 LCP: ${lcpValue.toFixed(2)}ms`);
        
        if (lcpValue > 2500) {
          console.warn('⚠️ LCP is above recommended threshold (2.5s)');
        } else if (lcpValue <= 2500) {
          console.log('✅ LCP is good!');
        }
      }
    });
  }, []);

  return { lcp };
}

/**
 * Hook لتحميل مسبق للصور
 */
export function useImagePreload(urls: string[]) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!urls.length) return;

    preloadImages(urls)
      .then(() => setIsLoaded(true))
      .catch((err) => {
        setError(err);
        console.error('Failed to preload images:', err);
      });
  }, [urls]);

  return { isLoaded, error };
}
