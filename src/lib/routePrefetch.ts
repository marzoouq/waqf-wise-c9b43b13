/**
 * Route Prefetching Utilities
 * تحميل مسبق للمسارات لتحسين الأداء
 * 
 * @version 2.0.0 - تحسينات المرحلة الثالثة
 * - Smart Prefetching based on user behavior
 * - Network-aware prefetching
 * - Priority-based loading
 * - Cache management with TTL
 */

import { useEffect, useCallback } from 'react';
import { shouldDeferHeavyOperations, getNetworkInfo } from '@/lib/network-utils';
import { productionLogger } from '@/lib/logger/production-logger';

// قائمة المسارات المهمة للتحميل المسبق مع الأولويات
const PREFETCH_ROUTES = {
  // أولوية عالية - يُحمّل فوراً
  dashboard: { loader: () => import('@/pages/Dashboard'), priority: 'high' as const },
  nazer: { loader: () => import('@/pages/NazerDashboard'), priority: 'high' as const },
  beneficiary: { loader: () => import('@/pages/BeneficiaryPortal'), priority: 'high' as const },
  
  // أولوية متوسطة - يُحمّل عند الخمول
  properties: { loader: () => import('@/pages/Properties'), priority: 'medium' as const },
  beneficiaries: { loader: () => import('@/pages/Beneficiaries'), priority: 'medium' as const },
  accounting: { loader: () => import('@/pages/Accounting'), priority: 'medium' as const },
  
  // أولوية منخفضة - يُحمّل فقط على اتصالات سريعة
  payments: { loader: () => import('@/pages/Payments'), priority: 'low' as const },
  reports: { loader: () => import('@/pages/Reports'), priority: 'low' as const },
} as const;

type RouteKey = keyof typeof PREFETCH_ROUTES;
type Priority = 'high' | 'medium' | 'low';

// تخزين المسارات المحملة مع TTL
interface CachedRoute {
  loadedAt: number;
  priority: Priority;
}

const loadedRoutes = new Map<RouteKey, CachedRoute>();
const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق

/**
 * التحقق مما إذا كان يجب تحميل المسار مسبقاً
 */
function shouldPrefetch(priority: Priority): boolean {
  const { isOnline, isSlowConnection, saveData, downlink } = getNetworkInfo();
  
  // لا تحمّل إذا كنا offline أو في وضع توفير البيانات
  if (!isOnline || saveData) return false;
  
  // على الاتصالات البطيئة، حمّل فقط الأولوية العالية
  if (isSlowConnection) {
    return priority === 'high';
  }
  
  // على الاتصالات المتوسطة (أقل من 1.5 Mbps)
  if (downlink < 1.5) {
    return priority !== 'low';
  }
  
  return true;
}

/**
 * التحقق مما إذا كان المسار مُحمّل ولم تنته صلاحيته
 */
function isCached(route: RouteKey): boolean {
  const cached = loadedRoutes.get(route);
  if (!cached) return false;
  
  return Date.now() - cached.loadedAt < CACHE_TTL;
}

/**
 * تحميل مسبق لمسار معين
 */
export function prefetchRoute(route: RouteKey): void {
  // التحقق من الـ cache
  if (isCached(route)) return;
  
  const routeConfig = PREFETCH_ROUTES[route];
  if (!routeConfig) return;
  
  // التحقق من إمكانية التحميل
  if (!shouldPrefetch(routeConfig.priority)) return;
  
  const executePrefetch = () => {
    routeConfig.loader()
      .then(() => {
        loadedRoutes.set(route, {
          loadedAt: Date.now(),
          priority: routeConfig.priority,
        });
        productionLogger.debug(`Prefetched route: ${route}`);
      })
      .catch(() => {
        // تجاهل أخطاء التحميل المسبق
      });
  };

  // تحميل في الخلفية عند الخمول
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(executePrefetch, { 
      timeout: routeConfig.priority === 'high' ? 1000 : 3000 
    });
  } else {
    // fallback للمتصفحات القديمة
    setTimeout(executePrefetch, routeConfig.priority === 'high' ? 50 : 200);
  }
}

/**
 * تحميل مسبق لعدة مسارات
 */
export function prefetchRoutes(routes: RouteKey[]): void {
  // ترتيب حسب الأولوية
  const sortedRoutes = [...routes].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[PREFETCH_ROUTES[a].priority] - priorityOrder[PREFETCH_ROUTES[b].priority];
  });

  sortedRoutes.forEach((route, index) => {
    // تأخير تدريجي لتجنب إغراق الشبكة
    const delay = index * (shouldDeferHeavyOperations() ? 500 : 150);
    setTimeout(() => prefetchRoute(route), delay);
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
    if (!shouldPrefetch('medium')) return;

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
    }, 3000);

    return () => clearTimeout(timer);
  }, [role]);
}

/**
 * تحميل مسبق للمسارات الشائعة
 */
export function prefetchCommonRoutes(): void {
  if (!shouldPrefetch('low')) return;
  
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
