/**
 * Hook للوحة التحكم التفاعلية
 * Interactive Dashboard Hook
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { ChartDataPoint } from '@/components/unified/UnifiedChart';
import { QUERY_CONFIG } from '@/lib/queryOptimization';
import { BeneficiaryService, PropertyService } from '@/services';

export function useInteractiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  // إحصائيات المستفيدين
  const { data: beneficiariesStats, isLoading: loadingBeneficiaries, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-beneficiaries', timeRange],
    queryFn: async () => {
      const result = await BeneficiaryService.getAll();
      const data = result.data || [];
      
      const categoryCount = data.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
    },
    ...QUERY_CONFIG.REPORTS,
  });

  // تحديث وقت آخر تحديث
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('interactive-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-beneficiaries'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-payments'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-properties'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-beneficiaries'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-payments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-properties'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
  };

  // إحصائيات المدفوعات
  const { data: paymentsStats, isLoading: loadingPayments, isRefetching: isRefetchingPayments } = useQuery({
    queryKey: ['dashboard-payments', timeRange],
    ...QUERY_CONFIG.REPORTS,
    queryFn: async () => {
      const startDate = new Date();
      if (timeRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (timeRange === 'quarter') startDate.setMonth(startDate.getMonth() - 3);
      else startDate.setFullYear(startDate.getFullYear() - 1);

      const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_type')
        .gte('payment_date', startDate.toISOString());
      
      if (error) throw error;

      const monthlyData = (data || []).reduce((acc, curr) => {
        const month = new Date(curr.payment_date).toLocaleDateString('ar-SA', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { month, total: 0, count: 0 };
        }
        acc[month].total += Number(curr.amount);
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { month: string; total: number; count: number }>);

      return Object.values(monthlyData) as ChartDataPoint[];
    },
  });

  // إحصائيات العقارات
  const { data: propertiesStats, isLoading: loadingProperties, isRefetching: isRefetchingProperties } = useQuery({
    queryKey: ['dashboard-properties'],
    ...QUERY_CONFIG.REPORTS,
    queryFn: async () => {
      const data = await PropertyService.getAll();

      const statusCount = (data || []).reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      })) as ChartDataPoint[];
    },
  });

  // KPIs الرئيسية
  const { data: kpis, isLoading: loadingKPIs, isRefetching: isRefetchingKPIs } = useDashboardKPIs();

  const isLoading = loadingBeneficiaries || loadingPayments || loadingProperties || loadingKPIs;
  const isRefetching = isRefetchingPayments || isRefetchingProperties || isRefetchingKPIs;

  return {
    timeRange,
    setTimeRange,
    chartType,
    setChartType,
    lastUpdated,
    beneficiariesStats,
    paymentsStats,
    propertiesStats,
    kpis,
    isLoading,
    isRefetching,
    handleRefresh,
  };
}
