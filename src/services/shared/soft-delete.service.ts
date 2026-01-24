/**
 * 🕋 Soft Delete Service
 * خدمة الحذف اللين - نظام الوقف المالي
 * @version 2.0.0 - تحسين Type Safety
 */

import { 
  softDeleteRecord, 
  restoreRecord, 
  type SoftDeletableTableName,
  type SoftDeleteResult 
} from '@/lib/supabase-type-helpers';

/**
 * الجداول المحمية من الحذف الفيزيائي
 */
export const PROTECTED_FINANCIAL_TABLES: string[] = [
  'payment_vouchers', 'journal_entries', 'distributions', 'contracts',
  'loans', 'rental_payments', 'invoices', 'payments', 'bank_accounts',
  'families', 'beneficiaries', 'tenants', 'properties', 'documents',
];

export type { SoftDeleteResult };

export function isProtectedTable(tableName: string): boolean {
  return PROTECTED_FINANCIAL_TABLES.includes(tableName);
}

/**
 * SoftDeleteService Class
 * يستخدم الآن supabase-type-helpers للأنواع الآمنة
 */
export class SoftDeleteService {
  static async softDelete(
    tableName: string,
    recordId: string,
    userId?: string,
    reason: string = 'حذف بواسطة المستخدم'
  ): Promise<void> {
    const result = await softDeleteRecord(
      tableName as SoftDeletableTableName,
      recordId,
      userId,
      reason
    );

    if (!result.success) {
      console.error('[SoftDeleteService] Error:', result.error);
      throw new Error(result.error);
    }
  }

  static async restore(tableName: string, recordId: string): Promise<void> {
    const result = await restoreRecord(
      tableName as SoftDeletableTableName,
      recordId
    );

    if (!result.success) {
      throw new Error(result.error);
    }
  }
}

export async function softDelete(
  tableName: string,
  recordId: string,
  reason: string
): Promise<SoftDeleteResult> {
  return softDeleteRecord(
    tableName as SoftDeletableTableName,
    recordId,
    undefined,
    reason
  );
}

export async function restoreDeleted(
  tableName: string,
  recordId: string
): Promise<SoftDeleteResult> {
  return restoreRecord(tableName as SoftDeletableTableName, recordId);
}

export const excludeDeleted = { deleted_at: null } as const;
