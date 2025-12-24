/**
 * Cache Times - أوقات الكاش الموحدة
 * @version 1.0.0
 * @module infrastructure/react-query
 * 
 * @description
 * تعريف موحد لأوقات الكاش المستخدمة في React Query
 * يجب استخدام هذه القيم في جميع QUERY_CONFIG
 */

export const CACHE_TIMES = {
  /** 1 hour - للبيانات نادرة التغيير */
  STATIC: 60 * 60 * 1000,
  
  /** 5 minutes - للبيانات العادية */
  STANDARD: 5 * 60 * 1000,
  
  /** 1 minute - للبيانات متغيرة الأهمية */
  DYNAMIC: 1 * 60 * 1000,
  
  /** No cache - للبيانات الحية */
  REALTIME: 0,
} as const;

export type CacheTimeKey = keyof typeof CACHE_TIMES;
