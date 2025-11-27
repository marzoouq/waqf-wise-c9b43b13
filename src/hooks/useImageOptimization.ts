/**
 * Hook لتحسين الصور وتحسين LCP
 */

import { useEffect, useState } from 'react';
import { 
  observeLCP, 
  optimizePageImages,
  preloadImages 
} from '@/lib/imageOptimization';
import { productionLogger } from '@/lib/logger/production-logger';

export function useImageOptimization() {
  const [lcp, setLcp] = useState<number | null>(null);

  useEffect(() => {
    // تحسين جميع الصور في الصفحة
    optimizePageImages();

    // مراقبة LCP
    observeLCP((lcpValue) => {
      setLcp(lcpValue);
      
      // تسجيل للتطوير فقط
      if (import.meta.env.DEV) {
        productionLogger.debug(`📊 LCP: ${lcpValue.toFixed(2)}ms`);
        
        if (lcpValue > 2500) {
          productionLogger.warn('⚠️ LCP is above recommended threshold (2.5s)');
        } else if (lcpValue <= 2500) {
          productionLogger.debug('✅ LCP is good!');
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
        productionLogger.error('Failed to preload images:', err);
      });
  }, [urls]);

  return { isLoaded, error };
}
