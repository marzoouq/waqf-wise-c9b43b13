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

  /**
   * إنشاء حساب جديد
   */
  static async createAccount(account: {
    code: string;
    name_ar: string;
    name_en?: string;
    account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    account_nature: 'debit' | 'credit';
    parent_id?: string;
    is_header?: boolean;
    description?: string;
  }): Promise<AccountRow> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([account])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating account', error);
      throw error;
    }
  }

  /**
   * تحديث حساب
   */
  static async updateAccount(id: string, updates: Partial<AccountRow>): Promise<AccountRow> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating account', error);
      throw error;
    }
  }

  /**
   * حذف حساب
   */
  static async deleteAccount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting account', error);
      throw error;
    }
  }

  /**
   * جلب حساب مع رصيده
   */
  static async getAccountWithBalance(id: string): Promise<AccountRow & { balance: number }> {
    try {
      const account = await this.getAccountById(id);
      if (!account) throw new Error('الحساب غير موجود');

      return { ...account, balance: account.current_balance || 0 };
    } catch (error) {
      productionLogger.error('Error fetching account with balance', error);
      throw error;
    }
  }

  /**
   * الموافقة على قيد محاسبي
   */
  static async approveJournalEntry(id: string, action: 'approve' | 'reject', notes?: string): Promise<JournalEntryRow> {
    try {
      const status = action === 'approve' ? 'posted' : 'cancelled';
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          status,
          posted_at: action === 'approve' ? new Date().toISOString() : undefined,
          notes: notes || undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (action === 'approve') {
        await this.updateAccountBalances(id);
      }

      return data;
    } catch (error) {
      productionLogger.error('Error approving journal entry', error);
      throw error;
    }
  }

  /**
   * جلب قوالب القيود التلقائية
   */
  static async getAutoJournalTemplates(): Promise<Database['public']['Tables']['auto_journal_templates']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .select('*')
        .eq('is_active', true)
        .order('priority');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching auto journal templates', error);
      throw error;
    }
  }

  /**
   * إنشاء قيد تلقائي
   */
  static async createAutoJournalEntry(params: {
    trigger: string;
    referenceId: string;
    referenceType: string;
    amount: number;
    description: string;
  }): Promise<JournalEntryRow | null> {
    try {
      const { data: templates } = await supabase
        .from('auto_journal_templates')
        .select('*')
        .eq('trigger_event', params.trigger)
        .eq('is_active', true)
        .order('priority')
        .limit(1);

      if (!templates || templates.length === 0) return null;

      const template = templates[0];
      const debitAccounts = template.debit_accounts as { account_id: string; percentage: number }[];
      const creditAccounts = template.credit_accounts as { account_id: string; percentage: number }[];

      const lines = [
        ...debitAccounts.map(acc => ({
          account_id: acc.account_id,
          debit_amount: (params.amount * acc.percentage) / 100,
          credit_amount: 0,
        })),
        ...creditAccounts.map(acc => ({
          account_id: acc.account_id,
          debit_amount: 0,
          credit_amount: (params.amount * acc.percentage) / 100,
        })),
      ];

      const { data: activeFY } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      const entry = await this.createJournalEntry(
        {
          description: params.description,
          entry_date: new Date().toISOString().split('T')[0],
          entry_number: `AUTO-${Date.now()}`,
          status: 'draft',
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          fiscal_year_id: activeFY?.id || '',
        },
        lines
      );

      // تسجيل في سجل القيود التلقائية
      await supabase.from('auto_journal_log').insert([{
        template_id: template.id,
        trigger_event: params.trigger,
        reference_id: params.referenceId,
        reference_type: params.referenceType,
        amount: params.amount,
        journal_entry_id: entry.id,
        success: true,
      }]);

      return entry;
    } catch (error) {
      productionLogger.error('Error creating auto journal entry', error);
      throw error;
    }
  }

  /**
   * جلب الميزانيات
   */
  static async getBudgets(fiscalYearId?: string): Promise<Database['public']['Tables']['budgets']['Row'][]> {
    try {
      let query = supabase.from('budgets').select('*');
      
      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query.order('period_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching budgets', error);
      throw error;
    }
  }

  /**
   * إنشاء ميزانية
   */
  static async createBudget(budget: Database['public']['Tables']['budgets']['Insert']): Promise<Database['public']['Tables']['budgets']['Row']> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating budget', error);
      throw error;
    }
  }

  /**
   * جلب سير عمل الموافقات
   */
  static async getApprovalWorkflows(): Promise<Database['public']['Tables']['approval_workflows']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('workflow_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching approval workflows', error);
      throw error;
    }
  }

  /**
   * جلب بيانات التدفق النقدي
   */
  static async getCashFlowData(fiscalYearId: string): Promise<Database['public']['Tables']['cash_flows']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .eq('fiscal_year_id', fiscalYearId)
        .order('period_start');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching cash flow data', error);
      throw error;
    }
  }

  /**
   * جلب ميزان المراجعة
   */
  static async getTrialBalance(fiscalYearId?: string): Promise<{
    accounts: (AccountRow & { debit_total: number; credit_total: number })[];
    totals: { debit: number; credit: number };
  }> {
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .eq('is_header', false)
        .order('code');

      if (accountsError) throw accountsError;

      // جلب مجموع القيود لكل حساب
      let entriesQuery = supabase
        .from('journal_entry_lines')
        .select('account_id, debit_amount, credit_amount, journal_entries!inner(status, fiscal_year_id)');

      if (fiscalYearId) {
        entriesQuery = entriesQuery.eq('journal_entries.fiscal_year_id', fiscalYearId);
      }
      
      entriesQuery = entriesQuery.eq('journal_entries.status', 'posted');

      const { data: lines, error: linesError } = await entriesQuery;

      if (linesError) throw linesError;

      // حساب المجاميع لكل حساب
      const accountTotals: Record<string, { debit: number; credit: number }> = {};
      (lines || []).forEach(line => {
        if (!accountTotals[line.account_id]) {
          accountTotals[line.account_id] = { debit: 0, credit: 0 };
        }
        accountTotals[line.account_id].debit += line.debit_amount || 0;
        accountTotals[line.account_id].credit += line.credit_amount || 0;
      });

      const result = (accounts || []).map(account => ({
        ...account,
        debit_total: accountTotals[account.id]?.debit || 0,
        credit_total: accountTotals[account.id]?.credit || 0,
      }));

      const totals = result.reduce(
        (acc, account) => ({
          debit: acc.debit + account.debit_total,
          credit: acc.credit + account.credit_total,
        }),
        { debit: 0, credit: 0 }
      );

      return { accounts: result, totals };
    } catch (error) {
      productionLogger.error('Error fetching trial balance', error);
      throw error;
    }
  }

  /**
   * جلب دفتر الأستاذ العام
   */
  static async getGeneralLedger(accountId: string, dateRange?: { from: string; to: string }): Promise<{
    account: AccountRow;
    entries: (JournalEntryLineRow & { journal_entry: JournalEntryRow })[];
    openingBalance: number;
    closingBalance: number;
  }> {
    try {
      const account = await this.getAccountById(accountId);
      if (!account) throw new Error('الحساب غير موجود');

      let query = supabase
        .from('journal_entry_lines')
        .select('*, journal_entries!inner(*)')
        .eq('account_id', accountId)
        .eq('journal_entries.status', 'posted');

      if (dateRange?.from) {
        query = query.gte('journal_entries.entry_date', dateRange.from);
      }
      if (dateRange?.to) {
        query = query.lte('journal_entries.entry_date', dateRange.to);
      }

      const { data, error } = await query.order('journal_entries(entry_date)', { ascending: true });

      if (error) throw error;

      const entries = (data || []).map(line => ({
        ...line,
        journal_entry: line.journal_entries as unknown as JournalEntryRow,
      }));

      // حساب الرصيد الافتتاحي والختامي
      let balance = account.current_balance || 0;
      const openingBalance = balance;

      entries.forEach(entry => {
        if (account.account_nature === 'debit') {
          balance += (entry.debit_amount || 0) - (entry.credit_amount || 0);
        } else {
          balance += (entry.credit_amount || 0) - (entry.debit_amount || 0);
        }
      });

      return {
        account,
        entries,
        openingBalance,
        closingBalance: balance,
      };
    } catch (error) {
      productionLogger.error('Error fetching general ledger', error);
      throw error;
    }
  }

  /**
   * جلب سطور القيد
   */
  static async getJournalEntryLines(journalEntryId: string): Promise<JournalEntryLineRow[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entry_lines')
        .select('*')
        .eq('journal_entry_id', journalEntryId)
        .order('line_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching journal entry lines', error);
      throw error;
    }
  }

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
}
