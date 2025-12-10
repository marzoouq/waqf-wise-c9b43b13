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

export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  status: string;
  reconciled_at?: string;
  created_at: string;
  updated_at: string;
  bank_accounts?: {
    bank_name: string;
    account_number: string;
    accounts?: { code: string; name_ar: string };
  };
}

export interface BankTransaction {
  id: string;
  statement_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: string;
  reference_number?: string;
  is_matched: boolean;
  journal_entry_id?: string;
  created_at: string;
}

export class BankReconciliationService {
  /**
   * جلب كشوف الحساب
   */
  static async getStatements(): Promise<BankStatement[]> {
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
      return (data || []) as BankStatement[];
    } catch (error) {
      logger.error(error, { context: 'fetch_bank_statements', severity: 'low' });
      return [];
    }
  }

  /**
   * جلب الحركات البنكية
   */
  static async getTransactions(): Promise<BankTransaction[]> {
    try {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return (data || []) as BankTransaction[];
    } catch (error) {
      logger.error(error, { context: 'fetch_bank_transactions', severity: 'low' });
      return [];
    }
  }

  /**
   * إنشاء كشف حساب
   */
  static async createStatement(statement: BankStatementInsert): Promise<BankStatement> {
    const { data, error } = await supabase
      .from("bank_statements")
      .insert([statement])
      .select()
      .single();

    if (error) throw error;
    return data as BankStatement;
  }

  /**
   * إضافة حركة بنكية
   */
  static async addTransaction(transaction: BankTransactionInsert): Promise<BankTransaction> {
    const { data, error } = await supabase
      .from("bank_transactions")
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data as BankTransaction;
  }

  /**
   * مطابقة حركة بنكية
   */
  static async matchTransaction({ transaction_id, journal_entry_id }: BankTransactionMatch): Promise<BankTransaction> {
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
    return data as BankTransaction;
  }

  /**
   * تسوية كشف الحساب
   */
  static async reconcileStatement(statementId: string): Promise<BankStatement> {
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
    return data as BankStatement;
  }
}
