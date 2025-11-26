import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceMetric, SlowQueryLog } from "@/types/performance";
import { Activity, Database, Zap, Clock } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";

export default function PerformanceDashboard() {
  const { data: metrics = [] } = useQuery({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as PerformanceMetric[];
    },
  });

  const { data: slowQueries = [], isLoading } = useQuery({
    queryKey: ["slow-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slow_query_log")
        .select("*")
        .order("execution_time_ms", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SlowQueryLog[];
    },
  });

  const latestMetrics = {
    pageLoad: metrics.find(m => m.metric_name === 'page_load_time')?.metric_value || 0,
    apiResponse: metrics.find(m => m.metric_name === 'api_response_time')?.metric_value || 0,
    dbQuery: metrics.find(m => m.metric_name === 'database_query_time')?.metric_value || 0,
    memoryUsage: metrics.find(m => m.metric_name === 'memory_usage')?.metric_value || 0,
  };

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
    <div className="container-custom py-6 space-y-6">
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
