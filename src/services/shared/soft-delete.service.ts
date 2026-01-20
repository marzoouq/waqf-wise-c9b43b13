/**
 * 🕋 Soft Delete Service
 * خدمة الحذف اللين - نظام الوقف المالي
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * الجداول المحمية من الحذف الفيزيائي
 */
export const PROTECTED_FINANCIAL_TABLES: string[] = [
  'payment_vouchers', 'journal_entries', 'distributions', 'contracts',
  'loans', 'rental_payments', 'invoices', 'payments', 'bank_accounts',
  'families', 'beneficiaries', 'tenants', 'properties', 'documents',
];

export interface SoftDeleteResult {
  success: boolean;
  error?: string;
  deletedAt?: string;
}

export function isProtectedTable(tableName: string): boolean {
  return PROTECTED_FINANCIAL_TABLES.includes(tableName);
}

/**
 * SoftDeleteService Class
 */
export class SoftDeleteService {
  static async softDelete(
    tableName: string,
    recordId: string,
    userId?: string,
    reason: string = 'حذف بواسطة المستخدم'
  ): Promise<void> {
    const deletedAt = new Date().toISOString();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from(tableName)
      .update({
        deleted_at: deletedAt,
        deleted_by: userId || null,
        deletion_reason: reason,
      })
      .eq('id', recordId);

    if (error) {
      console.error('[SoftDeleteService] Error:', error);
      throw error;
    }
  }

  static async restore(tableName: string, recordId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from(tableName)
      .update({
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
      })
      .eq('id', recordId);

    if (error) throw error;
  }
}

export async function softDelete(
  tableName: string,
  recordId: string,
  reason: string
): Promise<SoftDeleteResult> {
  try {
    await SoftDeleteService.softDelete(tableName, recordId, undefined, reason);
    return { success: true, deletedAt: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function restoreDeleted(
  tableName: string,
  recordId: string
): Promise<SoftDeleteResult> {
  try {
    await SoftDeleteService.restore(tableName, recordId);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export const excludeDeleted = { deleted_at: null } as const;
