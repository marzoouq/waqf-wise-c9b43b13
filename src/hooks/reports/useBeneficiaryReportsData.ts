/**
 * Hook for BeneficiaryReports data fetching
 * يجلب بيانات تقرير المستفيدين مع التحديث المباشر
 */

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BeneficiaryReportData } from "@/types/reports/index";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { BeneficiaryService, RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryReportsData() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const {
    data: beneficiaries = [],
    isLoading,
    isRefetching,
    dataUpdatedAt,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARIES_REPORT,
    queryFn: async () => {
      const result = await BeneficiaryService.getAll();
      return (result.data || []).map(b => ({
        id: b.id,
        full_name: b.full_name,
        national_id: b.national_id,
        phone: b.phone,
        email: b.email,
        category: b.category,
        status: b.status,
        city: b.city,
        tribe: b.tribe,
        created_at: b.created_at,
      })) as BeneficiaryReportData[];
    },
    ...QUERY_CONFIG.REPORTS,
  });

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable("beneficiaries", () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES_REPORT });
    });
    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES_REPORT });
  };

  return {
    beneficiaries,
    isLoading,
    isRefetching,
    lastUpdated,
    handleRefresh,
    error,
  };
}
