/**
 * 🕋 Soft Delete Service
 * خدمة الحذف اللين - نظام الوقف المالي
 * 
 * الحذف الفيزيائي ممنوع شرعاً وتقنياً في الجداول المالية.
 * هذه الخدمة توفر آلية الحذف اللين البديلة.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * الجداول المالية المحمية من الحذف الفيزيائي
 */
export const PROTECTED_FINANCIAL_TABLES = [
  'payment_vouchers',
  'journal_entries',
  'distributions',
  'contracts',
  'loans',
  'rental_payments',
  'invoices',
] as const;

export type ProtectedTable = typeof PROTECTED_FINANCIAL_TABLES[number];

/**
 * واجهة بيانات الحذف اللين
 */
export interface SoftDeleteData {
  deleted_at: string;
  deleted_by: string;
  deletion_reason: string;
}

/**
 * واجهة نتيجة الحذف اللين
 */
export interface SoftDeleteResult {
  success: boolean;
  error?: string;
  deletedAt?: string;
}

/**
 * التحقق من أن الجدول محمي
 */
export function isProtectedTable(tableName: string): tableName is ProtectedTable {
  return PROTECTED_FINANCIAL_TABLES.includes(tableName as ProtectedTable);
}

/**
 * تنفيذ الحذف اللين على سجل
 * 
 * @param tableName - اسم الجدول
 * @param recordId - معرف السجل
 * @param reason - سبب الحذف (إلزامي للتدقيق)
 * @returns نتيجة العملية
 * 
 * @example
 * ```typescript
 * const result = await softDelete('payment_vouchers', 'uuid-here', 'إلغاء بناءً على طلب المستفيد');
 * if (result.success) {
 *   console.log('تم الحذف اللين بنجاح');
 * }
 * ```
 */
export async function softDelete(
  tableName: ProtectedTable,
  recordId: string,
  reason: string
): Promise<SoftDeleteResult> {
  // التحقق من وجود السبب
  if (!reason || reason.trim().length < 10) {
    return {
      success: false,
      error: 'سبب الحذف مطلوب ويجب أن يكون 10 أحرف على الأقل',
    };
  }

  // الحصول على معرف المستخدم الحالي
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: 'يجب تسجيل الدخول لتنفيذ عملية الحذف',
    };
  }

  const deletedAt = new Date().toISOString();

  // تنفيذ الحذف اللين
  const { error } = await supabase
    .from(tableName)
    .update({
      deleted_at: deletedAt,
      deleted_by: user.id,
      deletion_reason: reason.trim(),
    })
    .eq('id', recordId)
    .is('deleted_at', null); // فقط السجلات غير المحذوفة

  if (error) {
    console.error('[SoftDelete] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    deletedAt,
  };
}

/**
 * التراجع عن الحذف اللين (استعادة السجل)
 * 
 * @param tableName - اسم الجدول
 * @param recordId - معرف السجل
 * @returns نتيجة العملية
 */
export async function restoreDeleted(
  tableName: ProtectedTable,
  recordId: string
): Promise<SoftDeleteResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: 'يجب تسجيل الدخول لاستعادة السجل',
    };
  }

  const { error } = await supabase
    .from(tableName)
    .update({
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
    })
    .eq('id', recordId)
    .not('deleted_at', 'is', null); // فقط السجلات المحذوفة

  if (error) {
    console.error('[RestoreDeleted] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * الحصول على السجلات المحذوفة (للتدقيق)
 * 
 * @param tableName - اسم الجدول
 * @param options - خيارات الاستعلام
 */
export async function getDeletedRecords(
  tableName: ProtectedTable,
  options?: {
    startDate?: string;
    endDate?: string;
    deletedBy?: string;
    limit?: number;
  }
) {
  let query = supabase
    .from(tableName)
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (options?.startDate) {
    query = query.gte('deleted_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('deleted_at', options.endDate);
  }

  if (options?.deletedBy) {
    query = query.eq('deleted_by', options.deletedBy);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GetDeletedRecords] Error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * إحصائيات الحذف اللين
 */
export async function getSoftDeleteStats() {
  const stats: Record<string, number> = {};

  for (const table of PROTECTED_FINANCIAL_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null);

    if (!error) {
      stats[table] = count || 0;
    }
  }

  return stats;
}

/**
 * Filter builder لاستبعاد السجلات المحذوفة
 * يُستخدم في جميع الاستعلامات
 * 
 * @example
 * ```typescript
 * const { data } = await supabase
 *   .from('payment_vouchers')
 *   .select('*')
 *   .is('deleted_at', null); // هذا ما تفعله الدالة
 * ```
 */
export const excludeDeleted = { deleted_at: null } as const;
