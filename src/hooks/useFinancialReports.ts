import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntryLineRow, AccountRow } from "@/types/supabase-helpers";

// أنواع محددة للاستعلامات
interface JournalEntryLineWithAccount {
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  accounts: {
    code: string;
    name_ar: string;
    account_type: string;
  };
  journal_entries: {
    status: string;
    fiscal_year_id: string;
  };
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
  assets: {
    current: number;
    fixed: number;
    total: number;
  };
  liabilities: {
    current: number;
    longTerm: number;
    total: number;
  };
  equity: {
    capital: number;
    reserves: number;
    total: number;
  };
}

export interface IncomeStatementData {
  revenue: {
    property: number;
    investment: number;
    other: number;
    total: number;
  };
  expenses: {
    administrative: number;
    operational: number;
    beneficiaries: number;
    total: number;
  };
  netIncome: number;
}

export function useFinancialReports(fiscalYearId?: string) {
  // Trial Balance
  const { data: trialBalance = [], isLoading: isLoadingTrial } = useQuery({
    queryKey: ["trial_balance", fiscalYearId],
    queryFn: async () => {
      const query = supabase
        .from("journal_entry_lines")
        .select(`
          account_id,
          debit_amount,
          credit_amount,
          accounts!inner (
            code,
            name_ar,
            account_type
          ),
          journal_entries!inner (
            status,
            fiscal_year_id
          )
        `)
        .eq("journal_entries.status", "posted");

      if (fiscalYearId) {
        query.eq("journal_entries.fiscal_year_id", fiscalYearId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by account
      const accountsMap = new Map<string, TrialBalanceAccount>();

      data.forEach((line: JournalEntryLineWithAccount) => {
        const accountId = line.account_id;
        if (!accountsMap.has(accountId)) {
          accountsMap.set(accountId, {
            account_id: accountId,
            code: line.accounts.code,
            name: line.accounts.name_ar,
            debit: 0,
            credit: 0,
            balance: 0,
          });
        }

        const account = accountsMap.get(accountId)!;
        account.debit += Number(line.debit_amount);
        account.credit += Number(line.credit_amount);
        account.balance = account.debit - account.credit;
      });

      return Array.from(accountsMap.values()).sort((a, b) => a.code.localeCompare(b.code));
    },
    enabled: true,
  });

  // Balance Sheet
  const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["balance_sheet", fiscalYearId],
    queryFn: async () => {
      const accounts = await supabase
        .from("accounts")
        .select("id, code, account_type");

      if (accounts.error) throw accounts.error;

      const balances = new Map<string, number>();

      // Get balances for all accounts
      for (const account of accounts.data) {
        try {
          const { data } = await supabase
            .rpc("calculate_account_balance", { account_uuid: account.id }) as { data: number | null };
          balances.set(account.id, data || 0);
        } catch (error) {
          balances.set(account.id, 0);
        }
      }

      // Calculate totals
      const result: BalanceSheetData = {
        assets: { current: 0, fixed: 0, total: 0 },
        liabilities: { current: 0, longTerm: 0, total: 0 },
        equity: { capital: 0, reserves: 0, total: 0 },
      };

      accounts.data.forEach((account) => {
        const balance = balances.get(account.id) || 0;

        if (account.code.startsWith("1.1")) {
          result.assets.current += balance;
        } else if (account.code.startsWith("1.2")) {
          result.assets.fixed += balance;
        } else if (account.code.startsWith("2.1")) {
          result.liabilities.current += balance;
        } else if (account.code.startsWith("2.2")) {
          result.liabilities.longTerm += balance;
        } else if (account.code.startsWith("3")) {
          if (account.code === "3.1") {
            result.equity.capital += balance;
          } else {
            result.equity.reserves += balance;
          }
        }
      });

      result.assets.total = result.assets.current + result.assets.fixed;
      result.liabilities.total = result.liabilities.current + result.liabilities.longTerm;
      result.equity.total = result.equity.capital + result.equity.reserves;

      return result;
    },
  });

  // Income Statement
  const { data: incomeStatement, isLoading: isLoadingIncome } = useQuery({
    queryKey: ["income_statement", fiscalYearId],
    queryFn: async () => {
      const accounts = await supabase
        .from("accounts")
        .select("id, code")
        .or("code.like.4%,code.like.5%");

      if (accounts.error) throw accounts.error;

      const balances = new Map<string, number>();

      for (const account of accounts.data) {
        try {
          const { data } = await supabase
            .rpc("calculate_account_balance", { account_uuid: account.id }) as { data: number | null };
          balances.set(account.id, data || 0);
        } catch (error) {
          balances.set(account.id, 0);
        }
      }

      const result: IncomeStatementData = {
        revenue: { property: 0, investment: 0, other: 0, total: 0 },
        expenses: { administrative: 0, operational: 0, beneficiaries: 0, total: 0 },
        netIncome: 0,
      };

      accounts.data.forEach((account) => {
        const balance = Math.abs(balances.get(account.id) || 0);

        if (account.code.startsWith("4.1")) {
          result.revenue.property += balance;
        } else if (account.code.startsWith("4.2")) {
          result.revenue.investment += balance;
        } else if (account.code.startsWith("4.3")) {
          result.revenue.other += balance;
        } else if (account.code.startsWith("5.1")) {
          result.expenses.administrative += balance;
        } else if (account.code.startsWith("5.2")) {
          result.expenses.operational += balance;
        } else if (account.code.startsWith("5.3")) {
          result.expenses.beneficiaries += balance;
        }
      });

      result.revenue.total = result.revenue.property + result.revenue.investment + result.revenue.other;
      result.expenses.total = result.expenses.administrative + result.expenses.operational + result.expenses.beneficiaries;
      result.netIncome = result.revenue.total - result.expenses.total;

      return result;
    },
  });

  return {
    trialBalance,
    balanceSheet,
    incomeStatement,
    isLoading: isLoadingTrial || isLoadingBalance || isLoadingIncome,
  };
}