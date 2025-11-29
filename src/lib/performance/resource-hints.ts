/**
 * Resource Hints للتحميل المسبق الذكي
 * Smart Resource Preloading
 */

import { productionLogger } from '@/lib/logger/production-logger';

/**
 * خريطة المسارات والموارد المرتبطة
 */
const ROUTE_RESOURCE_MAP: Record<string, string[]> = {
  '/': ['/login', '/about', '/services'],
  '/login': ['/dashboard', '/beneficiary/portal'],
  '/dashboard': ['/beneficiaries', '/properties', '/accounting'],
  '/beneficiaries': ['/beneficiary/profile', '/staff/requests'],
  '/properties': ['/contracts', '/maintenance'],
  '/accounting': ['/reports', '/bank-reconciliation'],
};

/**
 * الموارد الحرجة التي يجب تحميلها مسبقاً
 */
const CRITICAL_RESOURCES = [
  // الخطوط
  { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
  { href: 'https://fonts.gstatic.com', rel: 'preconnect', crossOrigin: 'anonymous' },
  // API
  { href: 'https://zsacuvrcohmraoldilph.supabase.co', rel: 'preconnect' },
];

/**
 * تهيئة Resource Hints الحرجة
 */
export function initCriticalResourceHints(): void {
  if (typeof document === 'undefined') return;

  CRITICAL_RESOURCES.forEach(resource => {
    const existing = document.querySelector(`link[href="${resource.href}"][rel="${resource.rel}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = resource.rel;
    link.href = resource.href;
    if (resource.crossOrigin) {
      link.crossOrigin = resource.crossOrigin;
    }
    document.head.appendChild(link);
  });

  if (import.meta.env.DEV) productionLogger.debug('✅ Critical resource hints initialized');
}

/**
 * تحميل مسبق للصفحات المتوقعة
 */
export function prefetchNextRoutes(currentPath: string): void {
  if (typeof document === 'undefined') return;

  const nextRoutes = ROUTE_RESOURCE_MAP[currentPath] || [];
  
  nextRoutes.forEach(route => {
    const existing = document.querySelector(`link[href="${route}"][rel="prefetch"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    document.head.appendChild(link);
  });

  if (nextRoutes.length > 0 && import.meta.env.DEV) {
    productionLogger.debug(`📦 Prefetched ${nextRoutes.length} routes from ${currentPath}`);
  }
}

/**
 * DNS Prefetch للنطاقات الخارجية
 */
export function dnsPrefetch(domains: string[]): void {
  if (typeof document === 'undefined') return;

  domains.forEach(domain => {
    const existing = document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * تحميل مسبق للصور الحرجة
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  if (typeof document === 'undefined') return;

  imageUrls.forEach(url => {
    const existing = document.querySelector(`link[href="${url}"][rel="preload"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * تحميل مسبق للـ chunks المهمة
 */
export function preloadChunks(chunkNames: string[]): void {
  if (typeof document === 'undefined') return;

  // البحث عن الـ chunks في الصفحة
  const scripts = document.querySelectorAll('script[src*="assets/"]');
  const chunkUrls: string[] = [];

  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      chunkNames.forEach(name => {
        if (src.includes(name)) {
          chunkUrls.push(src);
        }
      });
    }
  });

  // لا نحتاج لتحميل مسبق للـ chunks الموجودة بالفعل
  if (import.meta.env.DEV) productionLogger.debug(`📦 ${chunkUrls.length} chunks already loaded`);
}

/**
 * تنظيف Resource Hints القديمة
 */
export function cleanupResourceHints(): void {
  if (typeof document === 'undefined') return;

  const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
  prefetchLinks.forEach(link => {
    // إزالة الـ prefetch links القديمة (أكثر من 5 دقائق)
    const createdAt = link.getAttribute('data-created');
    if (createdAt) {
      const age = Date.now() - parseInt(createdAt, 10);
      if (age > 5 * 60 * 1000) {
        link.remove();
      }
    }
  });
}

/**
 * Hook للتكامل مع React Router
 */
export function useResourceHints(): {
  prefetchRoute: (path: string) => void;
  preloadImage: (url: string) => void;
} {
  return {
    prefetchRoute: (path: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'document';
      link.setAttribute('data-created', Date.now().toString());
      document.head.appendChild(link);
    },
    preloadImage: (url: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    },
  };
}

// تصدير الدوال الرئيسية
export default {
  initCriticalResourceHints,
  prefetchNextRoutes,
  dnsPrefetch,
  preloadCriticalImages,
  preloadChunks,
  cleanupResourceHints,
  useResourceHints,
};
