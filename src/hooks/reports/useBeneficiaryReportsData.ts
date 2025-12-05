/**
 * Hook for BeneficiaryReports data fetching
 * يجلب بيانات تقرير المستفيدين مع التحديث المباشر
 */

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BeneficiaryReportData } from "@/types/reports/index";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

export function useBeneficiaryReportsData() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const {
    data: beneficiaries = [],
    isLoading,
    isRefetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["beneficiaries-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, national_id, phone, email, category, status, city, tribe, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BeneficiaryReportData[];
    },
    ...QUERY_CONFIG.REPORTS,
  });

  // تحديث وقت آخر تحديث
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  // Real-time subscription للتحديث المباشر
  useEffect(() => {
    const channel = supabase
      .channel("beneficiaries-report-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "beneficiaries" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["beneficiaries-report"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["beneficiaries-report"] });
  };

  return {
    beneficiaries,
    isLoading,
    isRefetching,
    lastUpdated,
    handleRefresh,
  };
}
