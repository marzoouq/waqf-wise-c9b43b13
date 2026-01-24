/**
 * 🕋 Supabase Type Helpers
 * مساعدات الأنواع لـ Supabase - حل مشكلة as any في العمليات الديناميكية
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * أسماء الجداول المدعومة للعمليات الديناميكية
 */
export type SoftDeletableTableName = 
  | 'user_roles'
  | 'system_error_logs'
  | 'beneficiaries'
  | 'tenants'
  | 'contracts'
  | 'payment_vouchers'
  | 'journal_entries'
  | 'distributions'
  | 'loans'
  | 'rental_payments'
  | 'invoices'
  | 'payments'
  | 'bank_accounts'
  | 'families'
  | 'properties'
  | 'documents'
  | 'profiles'
  | 'activities'
  | 'maintenance_requests';

/**
 * نتيجة عملية الحذف اللين
 */
export interface SoftDeleteResult {
  success: boolean;
  error?: string;
  deletedAt?: string;
}

/**
 * تنفيذ الحذف اللين بشكل آمن على أي جدول يدعم ذلك
 * @param tableName اسم الجدول
 * @param recordId معرف السجل
 * @param userId معرف المستخدم المنفذ (اختياري)
 * @param reason سبب الحذف (اختياري)
 */
export async function softDeleteRecord(
  tableName: SoftDeletableTableName,
  recordId: string,
  userId?: string | null,
  reason?: string
): Promise<SoftDeleteResult> {
  const deletedAt = new Date().toISOString();
  
  try {
    const { error } = await supabase
      .from(tableName)
      .update({
        deleted_at: deletedAt,
        deleted_by: userId || null,
        deletion_reason: reason || 'حذف بواسطة المستخدم',
      })
      .eq('id', recordId);

    if (error) {
      console.error(`[SoftDelete] Error deleting from ${tableName}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, deletedAt };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * استعادة سجل محذوف بشكل آمن
 * @param tableName اسم الجدول
 * @param recordId معرف السجل
 */
export async function restoreRecord(
  tableName: SoftDeletableTableName,
  recordId: string
): Promise<SoftDeleteResult> {
  try {
    const { error } = await supabase
      .from(tableName)
      .update({
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
      })
      .eq('id', recordId);

    if (error) {
      console.error(`[SoftDelete] Error restoring ${tableName}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * الحذف اللين مع الحصول على معرف المستخدم الحالي تلقائياً
 */
export async function softDeleteWithCurrentUser(
  tableName: SoftDeletableTableName,
  recordId: string,
  reason?: string
): Promise<SoftDeleteResult> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id || null;
  
  return softDeleteRecord(tableName, recordId, userId, reason);
}
