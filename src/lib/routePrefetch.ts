/**
 * Route Prefetching Utilities
 * تحميل مسبق للمسارات لتحسين الأداء
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

/**
 * تحميل مسبق لمسار معين
 */
export function prefetchRoute(route: RouteKey): void {
  if (loadedRoutes.has(route)) return;
  
  const loader = PREFETCH_ROUTES[route];
  if (loader) {
    // تحميل في الخلفية عند الخمول
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loader().then(() => {
          loadedRoutes.add(route);
        });
      });
    } else {
      // fallback للمتصفحات القديمة
      setTimeout(() => {
        loader().then(() => {
          loadedRoutes.add(route);
        });
      }, 100);
    }
  }
}

/**
 * تحميل مسبق لعدة مسارات
 */
export function prefetchRoutes(routes: RouteKey[]): void {
  routes.forEach(prefetchRoute);
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

    // تأخير قليل لضمان تحميل الصفحة الحالية أولاً
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [role]);
}

/**
 * تحميل مسبق للمسارات الشائعة
 */
export function prefetchCommonRoutes(): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      prefetchRoutes(['dashboard', 'beneficiaries', 'properties']);
    });
  }
}
