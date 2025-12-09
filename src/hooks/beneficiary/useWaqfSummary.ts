/**
 * useWaqfSummary Hook
 * إدارة بيانات ملخص الوقف
 */

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.WAQF_SUMMARY,
    queryFn: () => DashboardService.getWaqfSummary(),
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
