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
    gcTime: 5 * 60 * 1000, // ✅ إضافة gcTime لمنع تراكم الذاكرة
    refetchOnWindowFocus: false, // ✅ تغيير لتقليل الطلبات الزائدة
    refetchOnMount: true,
    retry: 2,
  },
  
  REALTIME: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // ✅ إضافة gcTime
    refetchOnWindowFocus: true, // البيانات الحية تحتاج تحديث
    retry: 1,
  },
  
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // ✅ إضافة gcTime
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ البيانات الثابتة لا تحتاج تحديث عند التحميل
    retry: 2,
  },

  // ==================== لوحات التحكم ====================
  DASHBOARD_KPIS: {
    staleTime: 2 * 60 * 1000, // 2 minutes - للتحديث السريع
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
    refetchOnWindowFocus: true, // تحديث عند العودة للنافذة - مهم للوحات التحكم
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
    refetchOnWindowFocus: false, // ✅ التقارير لا تحتاج تحديث تلقائي
    retry: 2,
  },

  // ==================== الموافقات والتنبيهات ====================
  APPROVALS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled - manual refetch on user action
    refetchOnWindowFocus: true, // الموافقات مهمة - تحتاج تحديث
    retry: 2,
  },
  
  ALERTS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: true, // التنبيهات مهمة - تحتاج تحديث
    retry: 2,
  },

  // ==================== الرسوم البيانية والأنشطة ====================
  CHARTS: {
    staleTime: CACHE_TIMES.STATIC, // 1 hour
    gcTime: CACHE_TIMES.STATIC * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: false, // ✅ الرسوم لا تتغير كثيراً
    retry: 1,
  },
  
  ACTIVITIES: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: false, // ✅ الأنشطة لا تحتاج تحديث فوري
    retry: 2,
  },

  // ==================== المهام والقروض ====================
  TASKS: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchInterval: false as const, // Disabled
    refetchOnWindowFocus: false, // ✅ تقليل الطلبات
    retry: 2,
  },
  
  LOANS: {
    staleTime: CACHE_TIMES.STATIC, // 1 hour
    gcTime: CACHE_TIMES.STATIC * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  },

  // ==================== إعدادات جديدة ====================
  /** للبيانات المرجعية (المدن، الفئات، إلخ) */
  REFERENCE_DATA: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  },

  /** للقوائم الكبيرة مع pagination */
  PAGINATED_LIST: {
    staleTime: CACHE_TIMES.STANDARD, // 5 minutes
    gcTime: CACHE_TIMES.STANDARD * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
  },

  /** للبيانات الحساسة (موافقات، صلاحيات) */
  SENSITIVE: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: true, // مهم للبيانات الحساسة
    refetchOnMount: true,
    retry: 2,
  },
} as const;

export type QueryConfigKey = keyof typeof QUERY_CONFIG;
export type QueryConfigType = typeof QUERY_CONFIG[QueryConfigKey];
