import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceMetric, SlowQueryLog } from "@/types/performance";
import { Activity, Database, Zap, Clock } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحميل الصفحة</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.pageLoad.toFixed(2)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استجابة API</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.apiResponse.toFixed(3)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استعلام DB</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.dbQuery.toFixed(3)}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام الذاكرة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics.memoryUsage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

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
