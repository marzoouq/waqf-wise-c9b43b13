import { useQuery } from "@tanstack/react-query";
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

export function useNazerKPIs() {
  return useQuery({
    queryKey: ["nazer-kpis"],
    queryFn: async (): Promise<NazerKPIData> => {
      try {
        // جلب الأصول والإيرادات
        const { data: accountsData, error: accountsError } = await supabase
          .from('journal_entry_lines')
          .select('debit_amount, credit_amount, accounts(account_type)');

        if (accountsError) throw accountsError;

        let totalAssets = 0;
        let totalRevenue = 0;

        if (accountsData) {
          accountsData.forEach(line => {
            if (line.accounts?.account_type === 'asset') {
              totalAssets += (line.debit_amount || 0) - (line.credit_amount || 0);
            } else if (line.accounts?.account_type === 'revenue') {
              totalRevenue += (line.credit_amount || 0) - (line.debit_amount || 0);
            }
          });
        }

        // جلب المستفيدين النشطين
        const { count: beneficiariesCount } = await supabase
          .from('beneficiaries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'نشط');

        // جلب العقارات
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'نشط');

        const { count: occupiedCount } = await supabase
          .from('contracts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'نشط');

        // جلب القروض المستحقة
        const { count: loansCount } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .in('status', ['active', 'defaulted']);

        // جلب الحسابات البنكية
        const { data: bankAccounts } = await supabase
          .from('bank_accounts')
          .select('current_balance')
          .eq('is_active', true);

        const availableBudget = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;

        // حساب العائد الشهري
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const { data: monthlyData } = await supabase
          .from('journal_entry_lines')
          .select('credit_amount, debit_amount, journal_entries!inner(entry_date), accounts!inner(account_type)')
          .eq('accounts.account_type', 'revenue')
          .gte('journal_entries.entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
          .lte('journal_entries.entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

        let monthlyReturn = 0;
        if (monthlyData) {
          monthlyData.forEach(line => {
            monthlyReturn += (line.credit_amount || 0) - (line.debit_amount || 0);
          });
        }

        return {
          totalAssets,
          totalRevenue,
          activeBeneficiaries: beneficiariesCount || 0,
          activeProperties: propertiesCount || 0,
          occupiedProperties: occupiedCount || 0,
          pendingLoans: loansCount || 0,
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
}
