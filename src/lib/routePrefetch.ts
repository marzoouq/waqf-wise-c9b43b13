/**
 * Route Prefetching Utilities
 * تحميل مسبق للمسارات لتحسين الأداء
 * v2.9.33 - محسّن مع Network Information API
 */

import { useEffect, useCallback } from 'react';

// قائمة المسارات المهمة للتحميل المسبق
const PREFETCH_ROUTES = {
  dashboard: () => import('@/pages/Dashboard'),
  nazer: () => import('@/pages/NazerDashboard'),
  beneficiary: () => import('@/pages/BeneficiaryPortal'),
  properties: () => import('@/pages/Properties'),
  beneficiaries: () => import('@/pages/Beneficiaries'),
  accounting: () => import('@/pages/Accounting'),
  payments: () => import('@/pages/Payments'),
  reports: () => import('@/pages/Reports'),
} as const;

type RouteKey = keyof typeof PREFETCH_ROUTES;

// تخزين المسارات المحملة
const loadedRoutes = new Set<RouteKey>();

// التحقق من سرعة الاتصال
function shouldPrefetch(): boolean {
  // لا تحمّل مسبقاً على الاتصالات البطيئة
  if ('connection' in navigator) {
    const connection = (navigator as Navigator & { 
      connection?: { 
        effectiveType?: string; 
        saveData?: boolean 
      } 
    }).connection;
    
    if (connection?.saveData) return false;
    if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      return false;
    }
  }
  return true;
}

/**
 * تحميل مسبق لمسار معين
 */
export function prefetchRoute(route: RouteKey): void {
  if (loadedRoutes.has(route)) return;
  if (!shouldPrefetch()) return;
  
  const loader = PREFETCH_ROUTES[route];
  if (loader) {
    // تحميل في الخلفية عند الخمول
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          loader().then(() => {
            loadedRoutes.add(route);
          }).catch(() => {
            // تجاهل أخطاء التحميل المسبق
          });
        },
        { timeout: 2000 }
      );
    } else {
      // fallback للمتصفحات القديمة
      setTimeout(() => {
        loader().then(() => {
          loadedRoutes.add(route);
        }).catch(() => {
          // تجاهل أخطاء التحميل المسبق
        });
      }, 100);
    }
  }
}

/**
 * تحميل مسبق لعدة مسارات
 */
export function prefetchRoutes(routes: RouteKey[]): void {
  routes.forEach((route, index) => {
    // تأخير تدريجي لتجنب إغراق الشبكة
    setTimeout(() => prefetchRoute(route), index * 200);
  });
}

/**
 * Hook للتحميل المسبق عند التحويم على رابط
 */
export function usePrefetchOnHover(route: RouteKey) {
  const handleMouseEnter = useCallback(() => {
    prefetchRoute(route);
  }, [route]);

  return { onMouseEnter: handleMouseEnter };
}

/**
 * Hook للتحميل المسبق بناءً على الدور
 */
export function useRolePrefetch(role?: string) {
  useEffect(() => {
    if (!role) return;
    if (!shouldPrefetch()) return;

    // تأخير لضمان تحميل الصفحة الحالية أولاً
    const timer = setTimeout(() => {
      switch (role) {
        case 'nazer':
          prefetchRoutes(['beneficiaries', 'payments', 'reports', 'properties']);
          break;
        case 'admin':
          prefetchRoutes(['beneficiaries', 'properties', 'accounting', 'reports']);
          break;
        case 'accountant':
          prefetchRoutes(['accounting', 'reports', 'payments']);
          break;
        case 'beneficiary':
        case 'waqf_heir':
          prefetchRoutes(['beneficiary']);
          break;
        default:
          prefetchRoutes(['dashboard']);
      }
    }, 3000); // زيادة التأخير لتحسين الأداء الأولي

    return () => clearTimeout(timer);
  }, [role]);
}

/**
 * تحميل مسبق للمسارات الشائعة
 */
export function prefetchCommonRoutes(): void {
  if (!shouldPrefetch()) return;
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        prefetchRoutes(['dashboard', 'beneficiaries', 'properties']);
      },
      { timeout: 5000 }
    );
  }
}

/**
 * إعادة تعيين حالة التحميل المسبق (للاختبارات)
 */
export function resetPrefetchState(): void {
  loadedRoutes.clear();
}
