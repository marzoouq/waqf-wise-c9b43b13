import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FinancialLine } from "@/types/admin";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface OpeningBalance {
  opening_balance: number;
  accounts: {
    account_type: string;
    account_nature: string;
  } | null;
}

export function useFinancialData() {
  return useQuery({
    queryKey: ["financial-data"],
    queryFn: async (): Promise<FinancialData> => {
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
          .eq("fiscal_year_id", (await supabase
            .from("fiscal_years")
            .select("id")
            .eq("is_active", true)
            .single()).data?.id || '')
      ]);

      if (entriesResult.error) throw entriesResult.error;

      // Calculate totals by account type
      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;

      // حساب من القيود اليومية
      entriesResult.data?.forEach((line: FinancialLine) => {
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
      openingBalancesResult.data?.forEach((ob: OpeningBalance) => {
        const accountType = ob.accounts?.account_type;
        const balance = Number(ob.opening_balance || 0);

        if (accountType === 'asset') {
          totalAssets += balance;
        } else if (accountType === 'liability') {
          totalLiabilities += balance;
        } else if (accountType === 'equity') {
          totalEquity += balance;
        } else if (accountType === 'revenue') {
          totalRevenue += balance;
        } else if (accountType === 'expense') {
          totalExpenses += balance;
        }
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
    },
    ...QUERY_CONFIG.CHARTS,
  });
}
