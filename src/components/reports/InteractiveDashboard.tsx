import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, DollarSign, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { UnifiedChart } from '@/components/unified/UnifiedChart';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { ReportRefreshIndicator } from './ReportRefreshIndicator';
import { useInteractiveDashboard } from '@/hooks/dashboard/useInteractiveDashboard';

export function InteractiveDashboard() {
  const {
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
  } = useInteractiveDashboard();

  if (isLoading) {
    return <LoadingState message="جاري تحميل البيانات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات" message={(error as Error).message} onRetry={handleRefresh} />;
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
          value={kpis?.totalBeneficiaries?.toLocaleString('ar-SA') || '0'}
          icon={Users}
          variant="default"
        />
        <UnifiedKPICard
          title="العقارات"
          value={kpis?.totalProperties?.toLocaleString('ar-SA') || '0'}
          icon={Building2}
          variant="success"
        />
        <UnifiedKPICard
          title="إجمالي الإيرادات"
          value={`${kpis?.totalRevenue?.toLocaleString('ar-SA') || '0'} ريال`}
          icon={DollarSign}
          variant="warning"
        />
        <UnifiedKPICard
          title="العقارات النشطة"
          value={kpis?.activeProperties?.toLocaleString('ar-SA') || '0'}
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
