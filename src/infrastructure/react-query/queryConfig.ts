/**
 * Query Config - إعدادات الاستعلامات الموحدة
 * @version 1.0.0
 * @module infrastructure/react-query
 * 
 * @description
 * هذا الملف هو المصدر الوحيد لجميع إعدادات React Query
 * يجب عدم تعريف QUERY_CONFIG في أي ملف آخر
 * 
 * @example
 * ```typescript
 * import { QUERY_CONFIG } from '@/infrastructure/react-query';
 * 
 * useQuery({
 *   queryKey: ['data'],
 *   queryFn: fetchData,
 *   ...QUERY_CONFIG.DASHBOARD_KPIS
 * });
 * ```
 */

import { CACHE_TIMES } from './cacheTimes';

/**
 * Query configuration presets - إعدادات موحدة للاستعلامات
 * 
 * الفئات:
 * - DEFAULT: الإعداد الافتراضي للاستعلامات العامة
 * - DASHBOARD_KPIS: لمؤشرات الأداء الرئيسية
 * - ADMIN_KPIS: لمؤشرات لوحة المسؤول
 * - REPORTS: للتقارير
 * - REALTIME: للبيانات الحية
 * - STATIC: للبيانات الثابتة
 * - APPROVALS: للموافقات
 * - ALERTS: للتنبيهات
 * - CHARTS: للرسوم البيانية
 * - ACTIVITIES: للأنشطة
 * - TASKS: للمهام
 * - LOANS: للقروض
 */
export const QUERY_CONFIG = {
  // ==================== الإعدادات الأساسية ====================
  DEFAULT: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  
  REALTIME: {
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  },
  
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  },

  // ==================== لوحات التحكم ====================
  DASHBOARD_KPIS: {
    staleTime: 2 * 60 * 1000, // 2 minutes - للتحديث السريع
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
    refetchOnWindowFocus: true, // تحديث عند العودة للنافذة
    retry: 2,
  },
  
  ADMIN_KPIS: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  },

  // ==================== التقارير ====================
  REPORTS: {
    staleTime: 2 * 60 * 1000, // 2 minutes - للتقارير
    gcTime: 10 * 60 * 1000,
    refetchInterval: false as const, // يدوي فقط
    refetchOnWindowFocus: true,
    retry: 2,
  },

  // ==================== الموافقات والتنبيهات ====================
  APPROVALS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled - manual refetch on user action
    refetchOnWindowFocus: true,
    retry: 2,
  },
  
  ALERTS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: true,
    retry: 2,
  },

  // ==================== الرسوم البيانية والأنشطة ====================
  CHARTS: {
    staleTime: CACHE_TIMES.STATIC, // 1 hour
    gcTime: CACHE_TIMES.STATIC * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: false,
    retry: 1,
  },
  
  ACTIVITIES: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: false,
    retry: 2,
  },

  // ==================== المهام والقروض ====================
  TASKS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: true,
    retry: 2,
  },
  
  LOANS: {
    staleTime: CACHE_TIMES.STATIC, // 1 hour
    gcTime: CACHE_TIMES.STATIC * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  },
} as const;

export type QueryConfigKey = keyof typeof QUERY_CONFIG;
export type QueryConfigType = typeof QUERY_CONFIG[QueryConfigKey];
