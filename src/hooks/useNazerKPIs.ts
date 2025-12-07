import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { logger } from "@/lib/logger";

export interface NazerKPIData {
  totalAssets: number;
  totalRevenue: number;
  activeBeneficiaries: number;
  activeProperties: number;
  occupiedProperties: number;
  pendingLoans: number;
  availableBudget: number;
  monthlyReturn: number;
}

/**
 * Hook لجلب KPIs الناظر
 * ملاحظة: Realtime يُدار من خلال useNazerDashboardRealtime في NazerDashboard.tsx
 */
export function useNazerKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["nazer-kpis"],
    queryFn: async (): Promise<NazerKPIData> => {
      try {
        // تنفيذ جميع الاستعلامات بشكل متوازي
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const [
          accountsResult,
          beneficiariesResult,
          propertiesResult,
          contractsResult,
          loansResult,
          bankAccountsResult,
          monthlyDataResult
        ] = await Promise.all([
          supabase.from('journal_entry_lines').select('debit_amount, credit_amount, accounts(account_type)'),
          supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('status', 'نشط'),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'نشط'),
          supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('status', 'نشط'),
          supabase.from('loans').select('*', { count: 'exact', head: true }).in('status', ['active', 'defaulted']),
          supabase.from('bank_accounts').select('current_balance').eq('is_active', true),
          supabase.from('journal_entry_lines')
            .select('credit_amount, debit_amount, journal_entries!inner(entry_date), accounts!inner(account_type)')
            .eq('accounts.account_type', 'revenue')
            .gte('journal_entries.entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
            .lte('journal_entries.entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`)
        ]);

        // معالجة النتائج
        if (accountsResult.error) throw accountsResult.error;

        let totalAssets = 0;
        let totalRevenue = 0;

        if (accountsResult.data) {
          accountsResult.data.forEach(line => {
            if (line.accounts?.account_type === 'asset') {
              totalAssets += (line.debit_amount || 0) - (line.credit_amount || 0);
            } else if (line.accounts?.account_type === 'revenue') {
              totalRevenue += (line.credit_amount || 0) - (line.debit_amount || 0);
            }
          });
        }

        const availableBudget = bankAccountsResult.data?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;

        let monthlyReturn = 0;
        if (monthlyDataResult.data) {
          monthlyDataResult.data.forEach(line => {
            monthlyReturn += (line.credit_amount || 0) - (line.debit_amount || 0);
          });
        }

        return {
          totalAssets,
          totalRevenue,
          activeBeneficiaries: beneficiariesResult.count || 0,
          activeProperties: propertiesResult.count || 0,
          occupiedProperties: contractsResult.count || 0,
          pendingLoans: loansResult.count || 0,
          availableBudget,
          monthlyReturn
        };
      } catch (error) {
        logger.error(error, { context: 'fetch_nazer_kpis', severity: 'high' });
        throw error;
      }
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  return {
    ...query,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["nazer-kpis"] }),
  };
}
