/**
 * مكون لتحسين LCP (Largest Contentful Paint)
 * يعمل على:
 * 1. تحميل مسبق للخطوط
 * 2. تحميل مسبق للمكونات المهمة
 * 3. تقليل render-blocking resources
 */

import { useEffect } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

// دالة لإضافة preload للخطوط
function preloadFonts() {
  // قائمة الخطوط المهمة
  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
  ];

  criticalFonts.forEach(fontUrl => {
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://fonts.googleapis.com';
      document.head.appendChild(link);

      const link2 = document.createElement('link');
      link2.rel = 'preconnect';
      link2.href = 'https://fonts.gstatic.com';
      link2.crossOrigin = 'anonymous';
      document.head.appendChild(link2);
    }
  });
}

// دالة لتأجيل تحميل الموارد غير الحرجة
function deferNonCriticalResources() {
  // تأجيل تحميل الصور غير المرئية
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
  // إضافة fetchpriority للصور المهمة
  const heroImages = document.querySelectorAll('[data-hero], .hero-image, [data-priority="high"]');
  heroImages.forEach(img => {
    if (img instanceof HTMLImageElement && !img.fetchPriority) {
      img.fetchPriority = 'high';
    }
  });
}

// دالة لتحديد LCP element
function identifyLCPElement() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { 
        element?: Element;
        renderTime?: number;
        loadTime?: number;
      };
      
      if (lastEntry && import.meta.env.DEV) {
        const lcpTime = lastEntry.renderTime || lastEntry.loadTime || 0;
        const element = lastEntry.element;
        
        productionLogger.debug('LCP Element:', {
          time: `${lcpTime.toFixed(2)}ms`,
          element: element?.tagName,
          id: element?.id,
          class: element?.className
        });
        
        // تحذير إذا كان LCP عالي
        if (lcpTime > 2500) {
          productionLogger.warn(`⚠️ LCP عالي: ${lcpTime.toFixed(2)}ms - الحد الموصى به: 2500ms`);
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    // تجاهل الأخطاء في المتصفحات القديمة
  }
}

// دالة لتنظيف Service Worker القديم
async function cleanupOldServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        // تحقق من أن الـ SW نشط
        if (registration.active) {
          // إرسال رسالة للـ SW لتحديث الـ cache
          registration.active.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch (error) {
      productionLogger.debug('ServiceWorker cleanup error:', error);
    }
  }
}

export function LCPOptimizer() {
  useEffect(() => {
    // تنفيذ التحسينات عند تحميل الصفحة
    if (typeof window !== 'undefined') {
      // تنفيذ فوري
      preloadFonts();
      optimizeResourcePriority();
      
      // تنفيذ بعد التحميل الأولي
      if (document.readyState === 'complete') {
        deferNonCriticalResources();
        identifyLCPElement();
        cleanupOldServiceWorker();
      } else {
        window.addEventListener('load', () => {
          deferNonCriticalResources();
          identifyLCPElement();
          cleanupOldServiceWorker();
        }, { once: true });
      }
    }
  }, []);

  // لا يعرض أي UI
  return null;
}

export default LCPOptimizer;
