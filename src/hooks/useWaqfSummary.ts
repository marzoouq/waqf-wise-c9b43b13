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
      const [propertiesResult, fundsResult, beneficiariesResult, bankResult] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact" }),
        supabase.from("funds").select("allocated_amount"),
        supabase.from("beneficiaries").select("*", { count: "exact" }).eq("status", "نشط"),
        supabase.from("bank_accounts").select("current_balance"),
      ]);

      const totalPropertyValue = propertiesResult.data?.reduce(
        (sum, p) => sum + (p.monthly_revenue || 0) * 12, 
        0
      ) || 0;
      
      const totalFunds = fundsResult.data?.reduce(
        (sum, f) => sum + (f.allocated_amount || 0), 
        0
      ) || 0;
      
      const totalBankBalance = bankResult.data?.reduce(
        (sum, b) => sum + b.current_balance, 
        0
      ) || 0;

      return {
        propertiesCount: propertiesResult.count || 0,
        totalPropertyValue,
        totalFunds,
        beneficiariesCount: beneficiariesResult.count || 0,
        totalBankBalance,
        totalWaqfValue: totalPropertyValue + totalBankBalance,
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
