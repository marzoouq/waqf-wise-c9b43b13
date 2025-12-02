/**
 * مكون لتحسين LCP (Largest Contentful Paint)
 * محسّن لأداء أسرع
 */

import { useEffect } from 'react';

// دالة لتأجيل تحميل الموارد غير الحرجة
function deferNonCriticalResources() {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    if (!img.getAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.getAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

// دالة لتحسين أولوية الموارد
function optimizeResourcePriority() {
  const heroImages = document.querySelectorAll('[data-hero], .hero-image, [data-priority="high"]');
  heroImages.forEach(img => {
    if (img instanceof HTMLImageElement && !img.fetchPriority) {
      img.fetchPriority = 'high';
    }
  });
}

// دالة لتحديد LCP element (للتطوير فقط)
function identifyLCPElement() {
  if (typeof PerformanceObserver === 'undefined' || !import.meta.env.DEV) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { 
        element?: Element;
        renderTime?: number;
        loadTime?: number;
      };
      
      if (lastEntry) {
        const lcpTime = lastEntry.renderTime || lastEntry.loadTime || 0;
        
        if (lcpTime > 2500) {
          console.warn(`⚠️ LCP عالي: ${lcpTime.toFixed(0)}ms`);
        } else {
          console.log(`✅ LCP: ${lcpTime.toFixed(0)}ms`);
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // تجاهل الأخطاء
  }
}

export function LCPOptimizer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // تنفيذ فوري
    optimizeResourcePriority();
    
    // تنفيذ بعد التحميل
    const onLoad = () => {
      deferNonCriticalResources();
      identifyLCPElement();
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}

export default LCPOptimizer;
