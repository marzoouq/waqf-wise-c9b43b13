/**
 * Trial Balance Service - خدمة ميزان المراجعة
 * ميزان المراجعة ودفتر الأستاذ والقوائم المالية
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryLineRow = Database['public']['Tables']['journal_entry_lines']['Row'];

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface TrialBalanceAccount {
  account_id: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetData {
  assets: { current: number; fixed: number; total: number };
  liabilities: { current: number; longTerm: number; total: number };
  equity: { capital: number; reserves: number; total: number };
  retainedEarnings: number;
}

export interface IncomeStatementData {
  revenue: { property: number; investment: number; other: number; total: number };
  expenses: { administrative: number; operational: number; beneficiaries: number; total: number };
  netIncome: number;
}

export class TrialBalanceService {
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
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .maybeSingle();

      if (accountError) throw accountError;
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
        journal_entry:journal_entries(
          entry_number,
          entry_date,
          description,
          status
        )
      `)
      .eq("account_id", params.accountId)
      .order("created_at", { ascending: true });

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

      interface EntryLine {
        debit_amount?: number | null;
        credit_amount?: number | null;
        accounts?: {
          account_type?: string;
          account_nature?: string;
        };
      }

      interface OpeningBalance {
        opening_balance?: number | null;
        accounts?: {
          account_type?: string;
        };
      }

      // حساب من القيود اليومية
      (entriesResult.data as EntryLine[] | null)?.forEach((line) => {
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
      (openingBalancesResult.data as OpeningBalance[] | null)?.forEach((ob) => {
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
}
