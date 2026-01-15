import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { supabase } from "@/integrations/supabase/client";

export interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  fiscalYearId?: string;
  fiscalYearName?: string;
  fiscalYearStatus?: 'active' | 'closed';
}

export interface FiscalYearOption {
  id: string;
  name: string;
  is_active: boolean;
  is_closed: boolean;
  start_date: string;
  end_date: string;
}

/**
 * جلب قائمة السنوات المالية للاختيار
 */
export function useFiscalYearOptions() {
  return useQuery({
    queryKey: ['fiscal-year-options'],
    queryFn: async (): Promise<FiscalYearOption[]> => {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('id, name, is_active, is_closed, start_date, end_date')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}

/**
 * جلب البيانات المالية مع دعم السنة المالية
 */
export function useFinancialData(fiscalYearId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.FINANCIAL_DATA, fiscalYearId],
    queryFn: async (): Promise<FinancialData> => {
      // جلب السنة المالية المحددة أو النشطة
      let targetFiscalYear: FiscalYearOption | null = null;
      
      if (fiscalYearId) {
        const { data } = await supabase
          .from('fiscal_years')
          .select('id, name, is_active, is_closed, start_date, end_date')
          .eq('id', fiscalYearId)
          .maybeSingle();
        targetFiscalYear = data;
      } else {
        const { data } = await supabase
          .from('fiscal_years')
          .select('id, name, is_active, is_closed, start_date, end_date')
          .eq('is_active', true)
          .maybeSingle();
        targetFiscalYear = data;
      }

      // جلب البيانات المالية الأساسية
      const financialData = await AccountingService.getFinancialData();
      
      return {
        ...financialData,
        fiscalYearId: targetFiscalYear?.id,
        fiscalYearName: targetFiscalYear?.name,
        fiscalYearStatus: targetFiscalYear?.is_closed ? 'closed' : 'active',
      };
    },
    ...QUERY_CONFIG.CHARTS,
  });
}
