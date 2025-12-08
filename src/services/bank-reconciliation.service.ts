/**
 * Bank Reconciliation Service - خدمة التسوية البنكية
 * @version 2.8.22
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { 
  BankStatementInsert, 
  BankTransactionInsert,
  BankTransactionMatch 
} from "@/types/banking";

export class BankReconciliationService {
  /**
   * جلب كشوف الحساب
   */
  static async getStatements(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("bank_statements")
        .select(`
          *,
          bank_accounts!inner (
            bank_name,
            account_number,
            accounts (code, name_ar)
          )
        `)
        .order("statement_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(error, { context: 'fetch_bank_statements', severity: 'low' });
      return [];
    }
  }

  /**
   * جلب الحركات البنكية
   */
  static async getTransactions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(error, { context: 'fetch_bank_transactions', severity: 'low' });
      return [];
    }
  }

  /**
   * إنشاء كشف حساب
   */
  static async createStatement(statement: BankStatementInsert): Promise<any> {
    const { data, error } = await supabase
      .from("bank_statements")
      .insert([statement])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * إضافة حركة بنكية
   */
  static async addTransaction(transaction: BankTransactionInsert): Promise<any> {
    const { data, error } = await supabase
      .from("bank_transactions")
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * مطابقة حركة بنكية
   */
  static async matchTransaction({ transaction_id, journal_entry_id }: BankTransactionMatch): Promise<any> {
    const { data, error } = await supabase
      .from("bank_transactions")
      .update({
        is_matched: true,
        journal_entry_id: journal_entry_id,
      })
      .eq("id", transaction_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تسوية كشف الحساب
   */
  static async reconcileStatement(statementId: string): Promise<any> {
    const { data, error } = await supabase
      .from("bank_statements")
      .update({
        status: 'reconciled',
        reconciled_at: new Date().toISOString(),
      })
      .eq("id", statementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
