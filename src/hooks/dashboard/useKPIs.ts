import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { DashboardService } from "@/services/dashboard.service";
import { supabase } from "@/integrations/supabase/client";

export interface KPI {
  id: string;
  kpi_name: string;
  kpi_name_ar?: string;
  kpi_code: string;
  description?: string;
  calculation_formula: string;
  data_source: string;
  target_value?: number;
  warning_threshold?: number;
  danger_threshold?: number;
  unit?: string;
  icon?: string;
  color?: string;
  chart_type?: string;
  is_active: boolean;
  category?: string;
  current_value?: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: "up" | "down" | "stable";
  status?: "success" | "warning" | "danger" | "neutral";
}

export function useKPIs(category?: string) {
  const queryClient = useQueryClient();

  const { data: kpis = [], isLoading, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["kpis", category],
    ...QUERY_CONFIG.REPORTS,
    queryFn: async () => {
      const data = await DashboardService.getKPIDefinitions(category);

      const kpisWithValues = await Promise.all(
        data.map(async (kpi) => {
          const currentValue = await DashboardService.calculateKPIValue(kpi.kpi_code);
          const previousValue = currentValue * 0.95;
          const changePercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
          const trend = determineTrend(currentValue, kpi.target_value);
          const status = determineStatus(currentValue, kpi.target_value, null, null);

          return {
            id: kpi.id,
            kpi_name: kpi.kpi_name,
            kpi_name_ar: kpi.kpi_name,
            kpi_code: kpi.kpi_code,
            description: kpi.description,
            calculation_formula: kpi.calculation_formula || '',
            data_source: kpi.data_source || '',
            target_value: kpi.target_value,
            unit: kpi.unit,
            is_active: kpi.is_active ?? true,
            category: kpi.category,
            current_value: currentValue,
            previous_value: previousValue,
            change_percentage: changePercentage,
            trend,
            status,
          } as KPI;
        })
      );

      return kpisWithValues;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('kpis-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'distributions' }, () => {
        queryClient.invalidateQueries({ queryKey: ["kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, () => {
        queryClient.invalidateQueries({ queryKey: ["kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ["kpis"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        queryClient.invalidateQueries({ queryKey: ["kpis"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, category]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kpis", category] });
  };

  return {
    kpis,
    isLoading,
    isRefetching,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : undefined,
    refresh: handleRefresh,
  };
}

function determineTrend(
  currentValue?: number,
  targetValue?: number | null
): "up" | "down" | "stable" {
  if (!currentValue || !targetValue) return "stable";

  const percentage = (currentValue / targetValue) * 100;

  if (percentage > 100) return "up";
  if (percentage < 80) return "down";
  return "stable";
}

function determineStatus(
  currentValue: number,
  targetValue?: number | null,
  warningThreshold?: number | null,
  dangerThreshold?: number | null
): "success" | "warning" | "danger" | "neutral" {
  if (targetValue === null || targetValue === undefined) return "neutral";
  
  if (dangerThreshold !== null && dangerThreshold !== undefined && currentValue <= dangerThreshold) {
    return "danger";
  }
  if (warningThreshold !== null && warningThreshold !== undefined && currentValue <= warningThreshold) {
    return "warning";
  }
  if (currentValue >= targetValue) {
    return "success";
  }
  return "neutral";
}
