/**
 * useWaqfSummary Hook
 * إدارة بيانات ملخص الوقف
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WaqfSummaryData {
  propertiesCount: number;
  totalPropertyValue: number;
  totalFunds: number;
  beneficiariesCount: number;
  totalBankBalance: number;
  totalWaqfValue: number;
}

export function useWaqfSummary(enabled: boolean = true) {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["waqf-summary"],
    queryFn: async (): Promise<WaqfSummaryData> => {
      // استخدام function الجديدة للحصول على البيانات العامة دون RLS
      const { data: publicStats, error: publicError } = await supabase
        .rpc('get_waqf_public_stats');

      if (publicError) {
        console.error('Error fetching public stats:', publicError);
        throw publicError;
      }

      const stats = publicStats as {
        beneficiaries_count: number;
        properties_count: number;
        total_property_value: number;
        total_funds: number;
        total_bank_balance: number;
      };

      return {
        propertiesCount: stats.properties_count || 0,
        totalPropertyValue: stats.total_property_value || 0,
        totalFunds: stats.total_funds || 0,
        beneficiariesCount: stats.beneficiaries_count || 0,
        totalBankBalance: stats.total_bank_balance || 0,
        totalWaqfValue: (stats.total_property_value || 0) + (stats.total_bank_balance || 0),
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    summary,
    isLoading,
    error,
    refetch,
  };
}
