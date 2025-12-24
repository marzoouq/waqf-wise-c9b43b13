/**
 * Hook للوحة التحكم التفاعلية
 * Interactive Dashboard Hook
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedKPIs } from '@/hooks/dashboard/useUnifiedKPIs';
import { ChartDataPoint } from '@/components/unified/UnifiedChart';
import { QUERY_CONFIG } from '@/infrastructure/react-query';
import { BeneficiaryService, PropertyService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useInteractiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  // إحصائيات المستفيدين
  const { data: beneficiariesStats, isLoading: loadingBeneficiaries, dataUpdatedAt, error: beneficiariesError } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_BENEFICIARIES(timeRange),
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
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_BENEFICIARIES() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_PAYMENTS() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_PROPERTIES });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_BENEFICIARIES() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_PAYMENTS() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_PROPERTIES });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_KPIS });
  };

  // إحصائيات المدفوعات
  const { data: paymentsStats, isLoading: loadingPayments, isRefetching: isRefetchingPayments, error: paymentsError } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_PAYMENTS(timeRange),
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
  const { data: propertiesStats, isLoading: loadingProperties, isRefetching: isRefetchingProperties, error: propertiesError } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_PROPERTIES,
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

  // KPIs الرئيسية - استخدام الـ hook الموحد
  const { data: kpis, isLoading: loadingKPIs, isRefetching: isRefetchingKPIs } = useUnifiedKPIs();

  const isLoading = loadingBeneficiaries || loadingPayments || loadingProperties || loadingKPIs;
  const isRefetching = isRefetchingPayments || isRefetchingProperties || isRefetchingKPIs;
  const error = beneficiariesError || paymentsError || propertiesError;

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
    error,
    handleRefresh,
  };
}
