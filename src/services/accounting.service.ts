/**
 * Accounting Service - خدمة المحاسبة
 * 
 * تحتوي على منطق الأعمال المتعلق بالقيود المحاسبية والتقارير المالية
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

// استخدام الأنواع من قاعدة البيانات
type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
type JournalEntryLineRow = Database['public']['Tables']['journal_entry_lines']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export class AccountingService {
  /**
   * جلب جميع القيود المحاسبية
   */
  static async getJournalEntries(filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<JournalEntryRow[]> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as JournalEntryRow['status']);
      }
      if (filters?.fromDate) {
        query = query.gte('entry_date', filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte('entry_date', filters.toDate);
      }

      const { data, error } = await query.order('entry_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching journal entries', error);
      throw error;
    }
  }

  /**
   * جلب قيد محاسبي واحد
   */
  static async getJournalEntryById(id: string): Promise<JournalEntryRow | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching journal entry', error);
      throw error;
    }
  }

  /**
   * إنشاء قيد محاسبي جديد
   */
  static async createJournalEntry(
    entry: Omit<JournalEntryInsert, 'id' | 'created_at' | 'updated_at'>,
    lines: Array<{ account_id: string; debit_amount: number; credit_amount: number; description?: string }>
  ): Promise<JournalEntryRow> {
    try {
      // التحقق من توازن القيد
      const totalDebit = lines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('القيد غير متوازن: مجموع المدين لا يساوي مجموع الدائن');
      }

      // إنشاء القيد
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([entry])
        .select()
        .single();

      if (entryError) throw entryError;

      // إنشاء سطور القيد
      const entryLines = lines.map((line, index) => ({
        ...line,
        journal_entry_id: journalEntry.id,
        line_number: index + 1,
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(entryLines);

      if (linesError) throw linesError;

      return journalEntry;
    } catch (error) {
      productionLogger.error('Error creating journal entry', error);
      throw error;
    }
  }

  /**
   * ترحيل قيد محاسبي
   */
  static async postJournalEntry(id: string, postedBy: string): Promise<JournalEntryRow> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          status: 'posted',
          posted_by: postedBy,
          posted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // تحديث أرصدة الحسابات
      await this.updateAccountBalances(id);

      return data;
    } catch (error) {
      productionLogger.error('Error posting journal entry', error);
      throw error;
    }
  }

  /**
   * إلغاء قيد محاسبي
   */
  static async cancelJournalEntry(id: string): Promise<JournalEntryRow> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error cancelling journal entry', error);
      throw error;
    }
  }

  /**
   * جلب شجرة الحسابات
   */
  static async getChartOfAccounts(): Promise<AccountRow[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching chart of accounts', error);
      throw error;
    }
  }

  /**
   * جلب حساب واحد
   */
  static async getAccountById(id: string): Promise<AccountRow | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching account', error);
      throw error;
    }
  }

  /**
   * جلب الملخص المالي
   */
  static async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('account_type, current_balance')
        .eq('is_active', true)
        .eq('is_header', false);

      if (error) throw error;

      const summary: FinancialSummary = {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
      };

      (accounts || []).forEach(account => {
        const balance = account.current_balance || 0;
        switch (account.account_type) {
          case 'asset':
            summary.totalAssets += balance;
            break;
          case 'liability':
            summary.totalLiabilities += balance;
            break;
          case 'equity':
            summary.totalEquity += balance;
            break;
          case 'revenue':
            summary.totalRevenue += balance;
            break;
          case 'expense':
            summary.totalExpenses += balance;
            break;
        }
      });

      summary.netIncome = summary.totalRevenue - summary.totalExpenses;

      return summary;
    } catch (error) {
      productionLogger.error('Error fetching financial summary', error);
      throw error;
    }
  }

  /**
   * تحديث أرصدة الحسابات
   */
  private static async updateAccountBalances(journalEntryId: string): Promise<void> {
    try {
      const { data: lines, error } = await supabase
        .from('journal_entry_lines')
        .select('account_id, debit_amount, credit_amount')
        .eq('journal_entry_id', journalEntryId);

      if (error) throw error;

      for (const line of lines || []) {
        const { data: account } = await supabase
          .from('accounts')
          .select('current_balance, account_nature')
          .eq('id', line.account_id)
          .single();

        if (account) {
          let newBalance = account.current_balance || 0;
          if (account.account_nature === 'debit') {
            newBalance += (line.debit_amount || 0) - (line.credit_amount || 0);
          } else {
            newBalance += (line.credit_amount || 0) - (line.debit_amount || 0);
          }

          await supabase
            .from('accounts')
            .update({ current_balance: newBalance })
            .eq('id', line.account_id);
        }
      }
    } catch (error) {
      productionLogger.error('Error updating account balances', error);
      throw error;
    }
  }
}
