/**
 * Hook للوحة التحكم التفاعلية
 * Interactive Dashboard Hook
 * @version 2.0.0 - تم إصلاح مشكلة تراكم الاشتراكات
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedKPIs } from '@/hooks/dashboard/useUnifiedKPIs';
import { ChartDataPoint } from '@/components/unified/UnifiedChart';
import { QUERY_CONFIG } from '@/infrastructure/react-query';
import { BeneficiaryService, PropertyService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';
import { realtimeManager } from '@/services/realtime-manager';
import { queryInvalidationManager } from '@/lib/query-invalidation-manager';

export function useInteractiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  // استخدام ref لتجنب إعادة إنشاء الاشتراكات
  const queryClientRef = useRef(queryClient);
  useEffect(() => { queryClientRef.current = queryClient; }, [queryClient]);

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

  // Real-time subscriptions - باستخدام RealtimeManager المركزي
  useEffect(() => {
    const unsubBeneficiaries = realtimeManager.subscribe('beneficiaries', () => {
      queryInvalidationManager.invalidate(QUERY_KEYS.DASHBOARD_BENEFICIARIES());
    });

    const unsubPayments = realtimeManager.subscribe('payments', () => {
      queryInvalidationManager.invalidate(QUERY_KEYS.DASHBOARD_PAYMENTS());
    });

    const unsubProperties = realtimeManager.subscribe('properties', () => {
      queryInvalidationManager.invalidate(QUERY_KEYS.DASHBOARD_PROPERTIES);
    });

    return () => {
      unsubBeneficiaries();
      unsubPayments();
      unsubProperties();
    };
  }, []); // لا تبعيات = لا إعادة اشتراك

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
