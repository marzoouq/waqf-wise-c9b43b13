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
   * جلب جميع الحسابات
   */
  static async getAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching accounts', error);
      throw error;
    }
  }

  /**
   * جلب حساب بالرمز
   */
  static async getAccountByCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching account by code', error);
      throw error;
    }
  }

  /**
   * إنشاء حساب جديد
   */
  static async createAccount(account: {
    code: string;
    name_ar: string;
    name_en?: string | null;
    parent_id?: string | null;
    account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    account_nature: 'debit' | 'credit';
    description?: string | null;
    is_active?: boolean;
    is_header?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...account, is_active: account.is_active ?? true }])
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
  static async updateAccount(id: string, updates: {
    code?: string;
    name_ar?: string;
    name_en?: string | null;
    parent_id?: string | null;
    account_type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    account_nature?: 'debit' | 'credit';
    description?: string | null;
    is_active?: boolean;
    is_header?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
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
   * جلب الحسابات النشطة غير الرئيسية
   */
  static async getActiveLeafAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .eq('is_header', false)
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching active leaf accounts', error);
      throw error;
    }
  }

  /**
   * جلب السنوات المالية النشطة
   */
  static async getActiveFiscalYears() {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching active fiscal years', error);
      throw error;
    }
  }

  /**
   * توليد رقم قيد جديد
   */
  static async generateNextEntryNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const { data: lastEntry } = await supabase
        .from('journal_entries')
        .select('entry_number')
        .like('entry_number', `JV-${year}-%`)
        .order('entry_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNumber = 1;
      if (lastEntry && lastEntry.entry_number) {
        const match = lastEntry.entry_number.match(/JV-\d+-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `JV-${year}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      productionLogger.error('Error generating entry number', error);
      throw error;
    }
  }

  /**
   * جلب القيود مع سطورها
   */
  static async getJournalEntriesWithLines() {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_lines (
            *,
            accounts (code, name_ar)
          )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching journal entries with lines', error);
      throw error;
    }
  }

  /**
   * جلب القيود المحاسبية
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
   * جلب الميزانيات مع بيانات الحسابات
   */
  static async getBudgetsWithAccounts(fiscalYearId?: string): Promise<(Database['public']['Tables']['budgets']['Row'] & { accounts?: { code: string; name_ar: string; account_type: string } })[]> {
    try {
      let query = supabase.from('budgets').select(`
        *,
        accounts:account_id (
          code,
          name_ar,
          account_type
        )
      `);
      
      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query.order('period_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching budgets with accounts', error);
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
   * تحديث ميزانية
   */
  static async updateBudget(id: string, updates: Partial<Database['public']['Tables']['budgets']['Row']>): Promise<Database['public']['Tables']['budgets']['Row']> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating budget', error);
      throw error;
    }
  }

  /**
   * حذف ميزانية
   */
  static async deleteBudget(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting budget', error);
      throw error;
    }
  }

  /**
   * حساب انحرافات الميزانية
   */
  static async calculateBudgetVariances(fiscalYearId: string): Promise<void> {
    try {
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('id, account_id, budgeted_amount')
        .eq('fiscal_year_id', fiscalYearId);

      if (budgetsError) throw budgetsError;

      for (const budget of budgetsData || []) {
        const { data: actualData, error: actualError } = await supabase
          .from('journal_entry_lines')
          .select('debit_amount, credit_amount')
          .eq('account_id', budget.account_id);

        if (actualError) throw actualError;

        const actualAmount = actualData?.reduce((sum, line) => 
          sum + ((line.debit_amount || 0) - (line.credit_amount || 0)), 0) || 0;

        const varianceAmount = budget.budgeted_amount - actualAmount;

        await supabase
          .from('budgets')
          .update({
            actual_amount: actualAmount,
            variance_amount: varianceAmount,
          })
          .eq('id', budget.id);
      }
    } catch (error) {
      productionLogger.error('Error calculating budget variances', error);
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
   * جلب آخر القيود المحاسبية
   */
  static async getRecentJournalEntries(limit: number = 5): Promise<JournalEntryRow[]> {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, description, status, entry_date")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as JournalEntryRow[];
    } catch (error) {
      productionLogger.error('Error fetching recent journal entries', error);
      throw error;
    }
  }

  /**
   * جلب توزيع الحسابات حسب النوع
   */
  static async getAccountDistribution(): Promise<{ name: string; value: number; count: number }[]> {
    try {
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select("account_type")
        .eq("is_active", true);

      if (error) throw error;

      const distribution = new Map<string, number>();
      accounts?.forEach((account) => {
        const type = account.account_type;
        distribution.set(type, (distribution.get(type) || 0) + 1);
      });

      const typeLabels: Record<string, string> = {
        asset: 'الأصول',
        liability: 'الخصوم',
        equity: 'حقوق الملكية',
        revenue: 'الإيرادات',
        expense: 'المصروفات',
      };

      return Array.from(distribution.entries()).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
        count: count,
      }));
    } catch (error) {
      productionLogger.error('Error fetching account distribution', error);
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

  /**
   * جلب إحصائيات المحاسب (KPIs)
   */
  static async getAccountantKPIs(): Promise<{
    pendingApprovals: number;
    draftEntries: number;
    postedEntries: number;
    cancelledEntries: number;
    todayEntries: number;
    monthlyTotal: number;
    totalEntries: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthStart = startOfMonth.toISOString().split('T')[0];

      const [
        approvalsRes,
        draftRes,
        postedRes,
        cancelledRes,
        todayRes,
        monthlyRes,
        totalRes
      ] = await Promise.all([
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'posted'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('entry_date', today),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).gte('entry_date', monthStart),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true })
      ]);

      return {
        pendingApprovals: approvalsRes.count || 0,
        draftEntries: draftRes.count || 0,
        postedEntries: postedRes.count || 0,
        cancelledEntries: cancelledRes.count || 0,
        todayEntries: todayRes.count || 0,
        monthlyTotal: monthlyRes.count || 0,
        totalEntries: totalRes.count || 0,
      };
    } catch (error) {
      productionLogger.error('Error fetching accountant KPIs', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات أمين الصندوق
   */
  static async getCashierStats(): Promise<{
    cashBalance: number;
    todayReceipts: number;
    todayPayments: number;
    pendingTransactions: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [cashAccountsResult, receiptsResult, paymentsResult, pendingResult] = await Promise.all([
        supabase.from('bank_accounts').select('current_balance').eq('is_active', true),
        supabase.from('journal_entries')
          .select('*, journal_entry_lines(debit_amount, credit_amount)')
          .eq('entry_date', today)
          .eq('status', 'posted')
          .eq('reference_type', 'payment_receipt'),
        supabase.from('journal_entries')
          .select('*, journal_entry_lines(debit_amount, credit_amount)')
          .eq('entry_date', today)
          .eq('status', 'posted')
          .eq('reference_type', 'payment_voucher'),
        supabase.from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft')
      ]);

      if (cashAccountsResult.error) throw cashAccountsResult.error;
      if (receiptsResult.error) throw receiptsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;
      if (pendingResult.error) throw pendingResult.error;

      const cashBalance = cashAccountsResult.data?.reduce(
        (sum, acc) => sum + Number(acc.current_balance || 0),
        0
      ) || 0;

      const todayReceipts = receiptsResult.data?.reduce((sum, entry) => {
        const debitTotal = (Array.isArray(entry.journal_entry_lines) ? entry.journal_entry_lines : []).reduce(
          (s: number, line: { debit_amount?: number }) => s + Number(line.debit_amount || 0),
          0
        );
        return sum + debitTotal;
      }, 0) || 0;

      const todayPayments = paymentsResult.data?.reduce((sum, entry) => {
        const creditTotal = (Array.isArray(entry.journal_entry_lines) ? entry.journal_entry_lines : []).reduce(
          (s: number, line: { credit_amount?: number }) => s + Number(line.credit_amount || 0),
          0
        );
        return sum + creditTotal;
      }, 0) || 0;

      return {
        cashBalance,
        todayReceipts,
        todayPayments,
        pendingTransactions: pendingResult.count || 0,
      };
    } catch (error) {
      productionLogger.error('Error fetching cashier stats', error);
      throw error;
    }
  }

  // =============== Bank Matching Operations ===============

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
        .select('*, journal_entry_lines(*, accounts(*))')
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
   * جلب البيانات المالية الموحدة
   */
  static async getFinancialData(): Promise<FinancialSummary> {
    try {
      // جلب السنة المالية النشطة
      const { data: fiscalYear } = await supabase
        .from("fiscal_years")
        .select("id")
        .eq("is_active", true)
        .single();

      // جلب القيود اليومية والأرصدة الافتتاحية بالتوازي
      const [entriesResult, openingBalancesResult] = await Promise.all([
        supabase
          .from("journal_entry_lines")
          .select(`
            debit_amount,
            credit_amount,
            account_id,
            accounts (
              account_type,
              account_nature
            )
          `),
        supabase
          .from("opening_balances")
          .select(`
            opening_balance,
            accounts (
              account_type,
              account_nature
            )
          `)
          .eq("fiscal_year_id", fiscalYear?.id || '')
      ]);

      if (entriesResult.error) throw entriesResult.error;

      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      // حساب من القيود اليومية
      entriesResult.data?.forEach((line: any) => {
        const accountType = line.accounts?.account_type;
        const accountNature = line.accounts?.account_nature;
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);

        if (accountType === 'asset') {
          totalAssets += accountNature === 'debit' ? debit - credit : credit - debit;
        } else if (accountType === 'liability') {
          totalLiabilities += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'equity') {
          totalEquity += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'revenue') {
          totalRevenue += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'expense') {
          totalExpenses += accountNature === 'debit' ? debit - credit : credit - debit;
        }
      });

      // إضافة الأرصدة الافتتاحية
      openingBalancesResult.data?.forEach((ob: any) => {
        const accountType = ob.accounts?.account_type;
        const balance = Number(ob.opening_balance || 0);

        if (accountType === 'asset') totalAssets += balance;
        else if (accountType === 'liability') totalLiabilities += balance;
        else if (accountType === 'equity') totalEquity += balance;
        else if (accountType === 'revenue') totalRevenue += balance;
        else if (accountType === 'expense') totalExpenses += balance;
      });

      const netIncome = totalRevenue - totalExpenses;

      return {
        totalAssets,
        totalLiabilities,
        totalEquity: totalEquity + netIncome,
        totalRevenue,
        totalExpenses,
        netIncome,
      };
    } catch (error) {
      productionLogger.error('Error fetching financial data', error);
      throw error;
    }
  }

  /**
   * جلب التدفقات النقدية
   */
  static async getCashFlows(fiscalYearId?: string) {
    try {
      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching cash flows', error);
      throw error;
    }
  }

  /**
   * حساب وحفظ التدفقات النقدية
   */
  static async calculateCashFlow(params: {
    fiscalYearId: string;
    periodStart: string;
    periodEnd: string;
  }) {
    try {
      // حساب مبسط للتدفقات النقدية
      const { data: bankAccount } = await supabase
        .from('accounts')
        .select('current_balance')
        .eq('code', '1.1.1')
        .single();

      const openingCash = bankAccount?.current_balance || 0;

      const { data, error } = await supabase
        .from("cash_flows")
        .insert([{
          fiscal_year_id: params.fiscalYearId,
          period_start: params.periodStart,
          period_end: params.periodEnd,
          operating_activities: 0,
          investing_activities: 0,
          financing_activities: 0,
          net_cash_flow: 0,
          opening_cash: openingCash,
          closing_cash: openingCash,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error calculating cash flow', error);
      throw error;
    }
  }

  // ==================== دوال إضافية للموافقات والقيود ====================

  /**
   * جلب الموافقات المعلقة للمحاسب
   */
  static async getPendingApprovals() {
    const { data, error } = await supabase
      .from("approvals")
      .select(`
        *,
        journal_entry:journal_entries(*)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب حالة الموافقات للـ Workflow
   */
  static async getApprovalWorkflowStatus() {
    const { data, error } = await supabase
      .from("approval_status")
      .select(`
        *,
        approval_steps (*)
      `)
      .eq("status", "pending")
      .order("started_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * الموافقة على قيد
   */
  static async approveJournalApproval(approvalId: string, notes?: string) {
    const { error: approvalError } = await supabase
      .from('approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', approvalId);

    if (approvalError) throw approvalError;
  }

  /**
   * رفض قيد
   */
  static async rejectJournalApproval(approvalId: string, notes: string) {
    const { error } = await supabase
      .from('approvals')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        notes: notes,
      })
      .eq('id', approvalId);

    if (error) throw error;
  }

  /**
   * تحديث حالة القيد
   */
  static async updateJournalEntryStatus(entryId: string, status: 'draft' | 'posted' | 'cancelled') {
    const { error } = await supabase
      .from('journal_entries')
      .update({
        status,
        posted_at: status === 'posted' ? new Date().toISOString() : undefined,
      })
      .eq('id', entryId);

    if (error) throw error;
  }

  /**
   * جلب الميزانيات حسب نوع الفترة
   */
  static async getBudgetsByPeriod(periodType: string) {
    const { data, error } = await supabase
      .from("budgets")
      .select(`
        *,
        accounts (
          code,
          name_ar
        )
      `)
      .eq("period_type", periodType)
      .order("accounts(code)", { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب سطور القيد مع الحساب
   */
  static async getJournalEntryLinesWithAccount(entryId: string) {
    const { data, error } = await supabase
      .from("journal_entry_lines")
      .select(`
        *,
        account:accounts(code, name_ar)
      `)
      .eq("journal_entry_id", entryId)
      .order("line_number");

    if (error) throw error;
    return data || [];
  }

  /**
   * ترحيل القيد
   */
  static async postJournalEntryById(entryId: string) {
    const { error } = await supabase
      .from("journal_entries")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", entryId);

    if (error) throw error;
  }

  /**
   * جلب إقفالات السنوات المالية
   */
  static async getFiscalYearClosings() {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select(`
        *,
        fiscal_years (
          id,
          name,
          start_date,
          end_date,
          is_active,
          is_closed
        )
      `)
      .order("closing_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إقفال سنة مالية محددة
   */
  static async getClosingByFiscalYear(fiscalYearId: string) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select("*")
      .eq("fiscal_year_id", fiscalYearId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * إنشاء إقفال سنة مالية
   */
  static async createFiscalYearClosing(closing: any) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .insert(closing)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * تحديث إقفال سنة مالية
   */
  static async updateFiscalYearClosing(id: string, updates: any) {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * حساب ملخص السنة المالية
   */
  static async calculateFiscalYearSummary(fiscalYearId: string) {
    const { data, error } = await supabase
      .rpc("calculate_fiscal_year_summary", {
        p_fiscal_year_id: fiscalYearId,
      });

    if (error) throw error;
    return data;
  }

  /**
   * جلب دفتر الأستاذ للـ Hook
   */
  static async getGeneralLedgerForHook(params: {
    accountId: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    if (!params.accountId) return null;

    let query = supabase
      .from("journal_entry_lines")
      .select(`
        *,
        journal_entry:journal_entries!inner(
          entry_number,
          entry_date,
          description,
          status
        )
      `)
      .eq("account_id", params.accountId)
      .eq("journal_entry.status", "posted")
      .order("journal_entry(entry_date)", { ascending: true });

    if (params.dateFrom) {
      query = query.gte("journal_entry.entry_date", params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte("journal_entry.entry_date", params.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الحسابات للدفتر
   */
  static async getAccountsForLedger() {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, code, name_ar")
      .eq("is_active", true)
      .eq("is_header", false)
      .order("code");

    if (error) throw error;
    return data || [];
  }

  /**
   * جلب الفواتير
   */
  static async getInvoices(statusFilter?: string) {
    let query = supabase
      .from("invoices")
      .select("*")
      .order("invoice_date", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث حالة الفاتورة
   */
  static async updateInvoiceStatus(id: string, status: string) {
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  }
}
