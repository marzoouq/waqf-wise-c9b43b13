/**
 * React Query Infrastructure - البنية التحتية لـ React Query
 * @version 1.0.0
 * @module infrastructure/react-query
 * 
 * @description
 * هذا المجلد هو المصدر الوحيد لجميع إعدادات React Query
 * 
 * القواعد:
 * 1. لا تُنشئ QUERY_CONFIG في أي ملف آخر
 * 2. لا تُنشئ CACHE_TIMES في أي ملف آخر
 * 3. استخدم QUERY_KEYS من @/lib/query-keys
 * 
 * @example
 * ```typescript
 * import { QUERY_CONFIG, CACHE_TIMES } from '@/infrastructure/react-query';
 * import { QUERY_KEYS } from '@/lib/query-keys';
 * 
 * useQuery({
 *   queryKey: QUERY_KEYS.BENEFICIARIES,
 *   queryFn: fetchBeneficiaries,
 *   ...QUERY_CONFIG.DEFAULT
 * });
 * ```
 */

// تصدير إعدادات الاستعلامات
export { QUERY_CONFIG, type QueryConfigKey, type QueryConfigType } from './queryConfig';

// تصدير أوقات الكاش
export { CACHE_TIMES, type CacheTimeKey } from './cacheTimes';

// إعادة تصدير مفاتيح الاستعلامات من مصدرها الأصلي
export { QUERY_KEYS } from '@/lib/query-keys';
