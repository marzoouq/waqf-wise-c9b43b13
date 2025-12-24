/**
 * Unified Query Keys - مفاتيح الاستعلامات الموحدة
 * @version 3.0.0
 * @module lib/query-keys
 * 
 * @description
 * هذا الملف يوفر مفاتيح موحدة لجميع استعلامات React Query
 * لضمان الاتساق وتسهيل إدارة الكاش
 * 
 * تم تقسيم المفاتيح إلى ملفات حسب الـ Domain:
 * - beneficiary.keys.ts: مفاتيح المستفيدين
 * - properties.keys.ts: مفاتيح العقارات والعقود
 * - accounting.keys.ts: مفاتيح المحاسبة
 * - users.keys.ts: مفاتيح المستخدمين والصلاحيات
 * - dashboard.keys.ts: مفاتيح لوحات التحكم
 * - system.keys.ts: مفاتيح النظام والإعدادات
 * - support.keys.ts: مفاتيح الدعم الفني
 * - payments.keys.ts: مفاتيح المدفوعات والتوزيعات
 * 
 * @example
 * ```typescript
 * import { QUERY_KEYS, QUERY_CONFIG } from '@/lib/query-keys';
 * 
 * // استخدام مفتاح بسيط
 * useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES });
 * 
 * // استخدام مفتاح مع معاملات
 * useQuery({ queryKey: QUERY_KEYS.BENEFICIARY(id) });
 * ```
 */

import { BENEFICIARY_KEYS } from './beneficiary.keys';
import { PROPERTIES_KEYS } from './properties.keys';
import { ACCOUNTING_KEYS } from './accounting.keys';
import { USERS_KEYS } from './users.keys';
import { DASHBOARD_KEYS } from './dashboard.keys';
import { SYSTEM_KEYS } from './system.keys';
import { SUPPORT_KEYS } from './support.keys';
import { PAYMENTS_KEYS } from './payments.keys';

// دمج جميع المفاتيح في كائن واحد للتوافق مع الكود القديم
export const QUERY_KEYS = {
  ...BENEFICIARY_KEYS,
  ...PROPERTIES_KEYS,
  ...ACCOUNTING_KEYS,
  ...USERS_KEYS,
  ...DASHBOARD_KEYS,
  ...SYSTEM_KEYS,
  ...SUPPORT_KEYS,
  ...PAYMENTS_KEYS,
  
  // ✅ إعادة تسمية للتوافق مع الكود القديم (BENEFICIARY_PROFILE_REQUESTS → BENEFICIARY_PORTAL_REQUESTS)
  // الكود القديم يستخدم BENEFICIARY_PROFILE_REQUESTS، نحافظ عليه للتوافق
  BENEFICIARY_PROFILE_REQUESTS: BENEFICIARY_KEYS.BENEFICIARY_PORTAL_REQUESTS,
} as const;

// Query Config - إعادة تصدير من المصدر الجديد
// @deprecated استخدم @/infrastructure/react-query بدلاً من ذلك
export { QUERY_CONFIG } from '@/infrastructure/react-query';

// Type helpers
export type QueryKeyType = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];

// Re-export individual key modules for direct import
export { BENEFICIARY_KEYS } from './beneficiary.keys';
export { PROPERTIES_KEYS } from './properties.keys';
export { ACCOUNTING_KEYS } from './accounting.keys';
export { USERS_KEYS } from './users.keys';
export { DASHBOARD_KEYS } from './dashboard.keys';
export { SYSTEM_KEYS } from './system.keys';
export { SUPPORT_KEYS } from './support.keys';
export { PAYMENTS_KEYS } from './payments.keys';
