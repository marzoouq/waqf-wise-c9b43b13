/**
 * useDistributionAnalysisReport Hook
 * Hook لتحليل التوزيعات
 * @version 2.8.68
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DistributionService } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_CONFIG } from '@/infrastructure/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface DistributionTrendData {
  month: string;
  totalAmount: number;
  beneficiariesCount: number;
  distributionsCount: number;
  avgPerBeneficiary: number;
}

export interface StatusStatData {
  name: string;
  value: number;
}

export function useDistributionAnalysisReport() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const { data: distributionTrends, isLoading, isRefetching, dataUpdatedAt, error } = useQuery({
    queryKey: QUERY_KEYS.DISTRIBUTION_ANALYSIS,
    ...QUERY_CONFIG.REPORTS,
    queryFn: async (): Promise<DistributionTrendData[]> => {
      const distributions = await DistributionService.getAll();

      // تجميع البيانات حسب الشهر
      const monthlyData = (distributions || []).reduce((acc, dist) => {
        const month = new Date(dist.distribution_date).toLocaleDateString('ar-SA', { 
          month: 'short', 
          year: 'numeric' 
        });
        if (!acc[month]) {
          acc[month] = { 
            month, 
            totalAmount: 0, 
            beneficiariesCount: 0,
            distributionsCount: 0,
            avgPerBeneficiary: 0
          };
        }
        acc[month].totalAmount += Number(dist.total_amount);
        acc[month].beneficiariesCount += dist.beneficiaries_count;
        acc[month].distributionsCount += 1;
        return acc;
      }, {} as Record<string, DistributionTrendData>);

      // حساب المتوسط لكل مستفيد
      return Object.values(monthlyData).map((item) => ({
        ...item,
        avgPerBeneficiary: item.beneficiariesCount > 0 
          ? item.totalAmount / item.beneficiariesCount 
          : 0
      }));
    },
  });

  const { data: statusStats } = useQuery<StatusStatData[]>({
    queryKey: QUERY_KEYS.DISTRIBUTION_STATUS_STATS,
    ...QUERY_CONFIG.REPORTS,
    queryFn: async () => {
      const distributions = await DistributionService.getAll();

      const statusCount = (distributions || []).reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    },
  });

  // تحديث وقت آخر تحديث
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('distribution-report-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'distributions' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTION_ANALYSIS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTION_STATUS_STATS });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTION_ANALYSIS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTION_STATUS_STATS });
  };

  const totals = distributionTrends ? {
    totalAmount: distributionTrends.reduce((sum, d) => sum + d.totalAmount, 0),
    totalBeneficiaries: distributionTrends.reduce((sum, d) => sum + d.beneficiariesCount, 0),
    totalMonths: distributionTrends.length,
    monthlyAverage: distributionTrends.length > 0 
      ? distributionTrends.reduce((sum, d) => sum + d.totalAmount, 0) / distributionTrends.length 
      : 0,
  } : { totalAmount: 0, totalBeneficiaries: 0, totalMonths: 0, monthlyAverage: 0 };

  return {
    distributionTrends,
    statusStats,
    totals,
    isLoading,
    isRefetching,
    lastUpdated,
    handleRefresh,
    error,
  };
}
