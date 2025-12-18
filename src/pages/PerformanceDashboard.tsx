import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SlowQueryLog } from "@/types/performance";
import { Activity, Database, Zap, Clock } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { usePerformanceMetrics } from "@/hooks/performance/usePerformanceMetrics";

export default function PerformanceDashboard() {
  const { slowQueries, latestMetrics, isLoading } = usePerformanceMetrics();

  const columns: Column<SlowQueryLog>[] = [
    {
      key: "query_text",
      label: "الاستعلام",
      render: (value: string) => (
        <code className="text-xs">{value.substring(0, 100)}...</code>
      )
    },
    {
      key: "execution_time_ms",
      label: "وقت التنفيذ (ms)",
      render: (value: number) => (
        <span className="font-bold">{value.toFixed(0)} ms</span>
      )
    },
  ];

  return (
    <div className="container-custom py-6 space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="لوحة الأداء"
        description="مراقبة أداء النظام والاستعلامات"
      />

      {/* مقاييس الأداء */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="تحميل الصفحة"
          value={`${latestMetrics.pageLoad.toFixed(2)}s`}
          icon={Zap}
          variant="default"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استجابة API"
          value={`${latestMetrics.apiResponse.toFixed(3)}s`}
          icon={Activity}
          variant="success"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استعلام DB"
          value={`${latestMetrics.dbQuery.toFixed(3)}s`}
          icon={Database}
          variant="default"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استخدام الذاكرة"
          value={`${latestMetrics.memoryUsage.toFixed(1)}%`}
          icon={Clock}
          variant="warning"
          loading={isLoading}
        />
      </UnifiedStatsGrid>

      {/* الاستعلامات البطيئة */}
      <Card>
        <CardHeader>
          <CardTitle>الاستعلامات البطيئة</CardTitle>
          <CardDescription>الاستعلامات التي تحتاج إلى تحسين</CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={slowQueries}
            loading={isLoading}
            emptyMessage="لا توجد استعلامات بطيئة"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
