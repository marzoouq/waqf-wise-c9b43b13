import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, DollarSign, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { UnifiedChart, ChartDataPoint } from '@/components/unified/UnifiedChart';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { ReportRefreshIndicator } from './ReportRefreshIndicator';
import { QUERY_CONFIG } from '@/lib/queryOptimization';

export function InteractiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  // إحصائيات المستفيدين
  const { data: beneficiariesStats, isLoading: loadingBeneficiaries, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-beneficiaries', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('category, status, created_at');
      
      if (error) throw error;
      
      // تجميع البيانات حسب الفئة
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

      // تجميع البيانات حسب الشهر
      const monthlyData = data.reduce((acc, curr) => {
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
      const { data, error } = await supabase
        .from('properties')
        .select('status, type');
      
      if (error) throw error;

      const statusCount = data.reduce((acc, curr) => {
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

  if (isLoading) {
    return <LoadingState message="جاري تحميل البيانات..." />;
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">الشهر الماضي</SelectItem>
              <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">السنة الماضية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(v) => setChartType(v as 'bar' | 'line' | 'pie')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نوع الرسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">رسم بياني عمودي</SelectItem>
              <SelectItem value="line">رسم بياني خطي</SelectItem>
              <SelectItem value="pie">رسم دائري</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ReportRefreshIndicator
          lastUpdated={lastUpdated}
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
        />
      </div>

      {/* KPIs */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="إجمالي المستفيدين"
          value={kpis?.beneficiaries.toLocaleString('ar-SA') || '0'}
          icon={Users}
          variant="default"
        />
        <UnifiedKPICard
          title="العقارات"
          value={kpis?.properties.toLocaleString('ar-SA') || '0'}
          icon={Building2}
          variant="success"
        />
        <UnifiedKPICard
          title="إجمالي المدفوعات"
          value={`${kpis?.totalPayments.toLocaleString('ar-SA') || '0'} ريال`}
          icon={DollarSign}
          variant="warning"
        />
        <UnifiedKPICard
          title="العقود النشطة"
          value={kpis?.activeContracts.toLocaleString('ar-SA') || '0'}
          icon={Calendar}
          variant="default"
        />
      </UnifiedStatsGrid>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المدفوعات */}
        <UnifiedChart
          title="المدفوعات حسب الفترة"
          description="تحليل المدفوعات خلال الفترة المحددة"
          type={chartType === 'pie' ? 'pie' : chartType}
          data={paymentsStats || []}
          series={chartType !== 'pie' ? [
            { dataKey: "total", name: "المجموع", color: "hsl(var(--chart-1))" }
          ] : undefined}
          xAxisKey={chartType !== 'pie' ? "month" : undefined}
          height={300}
        />

        {/* المستفيدون حسب الفئة */}
        <UnifiedChart
          title="المستفيدون حسب الفئة"
          description="توزيع المستفيدين على الفئات المختلفة"
          type="pie"
          data={beneficiariesStats || []}
          height={300}
        />
      </div>

      {/* العقارات حسب الحالة */}
      <UnifiedChart
        title="العقارات حسب الحالة"
        description="توزيع العقارات حسب حالتها"
        type="bar"
        data={propertiesStats || []}
        series={[
          { dataKey: "value", name: "العدد", color: "hsl(var(--chart-2))" }
        ]}
        xAxisKey="name"
        height={300}
      />
    </div>
  );
}
