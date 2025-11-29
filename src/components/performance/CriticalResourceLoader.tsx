/**
 * Critical Resource Loader - تحميل الموارد الحرجة مبكراً
 * يُحسّن LCP عبر تحميل مسبق للموارد المهمة
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// قائمة الصفحات الشائعة للتحميل المسبق
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  '/login': ['/dashboard', '/redirect'],
  '/dashboard': ['/beneficiaries', '/properties', '/accounting'],
  '/beneficiaries': ['/beneficiaries/', '/families'],
  '/accounting': ['/payment-vouchers', '/reports'],
  '/': ['/login', '/signup'],
};

// تحميل مسبق للصفحة
function prefetchRoute(path: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  link.as = 'document';
  
  // تجنب التكرار
  const existing = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
}

// تحميل مسبق للصور المهمة
function prefetchCriticalImages() {
  const criticalImages = document.querySelectorAll<HTMLImageElement>(
    'img[data-critical="true"], img[fetchpriority="high"], .hero-image img'
  );
  
  criticalImages.forEach(img => {
    if (img.src && !img.complete) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = img.src;
      document.head.appendChild(preloadLink);
    }
  });
}

// تأجيل الموارد غير الحرجة
function deferNonCritical() {
  // تأجيل الـ iframes
  const iframes = document.querySelectorAll('iframe:not([loading])');
  iframes.forEach(iframe => {
    iframe.setAttribute('loading', 'lazy');
  });
  
  // تأجيل الصور خارج viewport
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-lazy="true"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-lazy');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

export function CriticalResourceLoader() {
  const location = useLocation();
  
  useEffect(() => {
    // تحميل مسبق للصفحات المرتبطة
    const routesToPrefetch = ROUTE_PREFETCH_MAP[location.pathname];
    if (routesToPrefetch) {
      // تأخير قليل لعدم التأثير على التحميل الأولي
      const timeoutId = setTimeout(() => {
        routesToPrefetch.forEach(prefetchRoute);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    // تنفيذ بعد التحميل الأولي
    if (document.readyState === 'complete') {
      prefetchCriticalImages();
      deferNonCritical();
    } else {
      window.addEventListener('load', () => {
        prefetchCriticalImages();
        deferNonCritical();
      }, { once: true });
    }
  }, []);
  
  return null;
}

export default CriticalResourceLoader;
