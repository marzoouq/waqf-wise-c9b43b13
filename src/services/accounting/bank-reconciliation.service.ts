/**
 * Bank Reconciliation Service - خدمة التسوية البنكية
 * إدارة الحسابات البنكية والمطابقة
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

export class BankReconciliationService {
  /**
   * جلب الحسابات البنكية
   */
  static async getBankAccounts(): Promise<Database['public']['Tables']['bank_accounts']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('bank_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching bank accounts', error);
      throw error;
    }
  }

  /**
   * جلب كشف حساب بنكي
   */
  static async getBankStatement(bankAccountId: string): Promise<Database['public']['Tables']['bank_statements']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('bank_statements')
        .select('*')
        .eq('bank_account_id', bankAccountId)
        .order('statement_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching bank statement', error);
      throw error;
    }
  }

  /**
   * جلب قواعد المطابقة البنكية
   */
  static async getBankMatchingRules() {
    try {
      const { data, error } = await supabase
        .from('bank_matching_rules')
        .select('id, rule_name, description, conditions, account_mapping, priority, is_active, match_count, last_matched_at, created_at, updated_at')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching bank matching rules', error);
      throw error;
    }
  }

  /**
   * جلب سجلات المطابقة
   */
  static async getBankReconciliationMatches() {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliation_matches')
        .select('id, bank_transaction_id, journal_entry_id, match_type, confidence_score, matching_rule_id, matched_at, matched_by, notes')
        .order('matched_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching bank reconciliation matches', error);
      throw error;
    }
  }

  /**
   * جلب العمليات البنكية غير المطابقة
   */
  static async getUnmatchedBankTransactions(statementId: string) {
    try {
      const { data, error } = await supabase
        .from('bank_transactions')
        .select('id, statement_id, transaction_date, amount, description, transaction_type, reference_number, is_matched, journal_entry_id, created_at')
        .eq('statement_id', statementId)
        .eq('is_matched', false);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching unmatched bank transactions', error);
      throw error;
    }
  }

  /**
   * جلب القيود المرحلة للمطابقة
   */
  static async getPostedEntriesForMatching() {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *, 
          journal_entry_lines!fk_jel_journal_entry(
            *, 
            accounts:accounts!fk_jel_account(id, code, name_ar, account_type)
          )
        `)
        .eq('status', 'posted');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching posted entries for matching', error);
      throw error;
    }
  }

  /**
   * إنشاء سجل مطابقة بنكية
   */
  static async createBankMatch(match: {
    bank_transaction_id: string;
    journal_entry_id: string;
    match_type: 'auto' | 'manual' | 'suggested';
    confidence_score: number;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('bank_reconciliation_matches')
        .insert(match)
        .select()
        .single();

      if (error) throw error;

      // تحديث حالة العملية البنكية
      await supabase
        .from('bank_transactions')
        .update({ is_matched: true, journal_entry_id: match.journal_entry_id })
        .eq('id', match.bank_transaction_id);

      return data;
    } catch (error) {
      productionLogger.error('Error creating bank match', error);
      throw error;
    }
  }

  /**
   * إلغاء مطابقة بنكية
   */
  static async deleteBankMatch(matchId: string) {
    try {
      // جلب بيانات المطابقة أولاً
      const { data: match, error: fetchError } = await supabase
        .from('bank_reconciliation_matches')
        .select('id, bank_transaction_id, journal_entry_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // حذف المطابقة
      const { error } = await supabase
        .from('bank_reconciliation_matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      // إعادة حالة العملية البنكية
      await supabase
        .from('bank_transactions')
        .update({ is_matched: false, journal_entry_id: null })
        .eq('id', match.bank_transaction_id);

    } catch (error) {
      productionLogger.error('Error deleting bank match', error);
      throw error;
    }
  }

  /**
   * جلب العمليات البنكية
   */
  static async getBankTransactions(statementId: string) {
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('statement_id', statementId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء عملية بنكية
   */
  static async createBankTransaction(transaction: Database['public']['Tables']['bank_transactions']['Insert']) {
    const { data, error } = await supabase
      .from('bank_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث حالة التسوية
   */
  static async updateReconciliationStatus(statementId: string) {
    const { error } = await supabase
      .from('bank_statements')
      .update({ 
        status: 'reconciled',
        reconciled_at: new Date().toISOString()
      })
      .eq('id', statementId);

    if (error) throw error;
  }
}
