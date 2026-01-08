import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Zap, MemoryStick, RefreshCw } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { usePerformanceMetrics, type SlowQueryLog } from "@/hooks/performance/usePerformanceMetrics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PerformanceDashboard() {
  const { slowQueries, latestMetrics, isLoading, diagnostics } = usePerformanceMetrics();

  const columns: Column<SlowQueryLog>[] = [
    {
      key: "query_text",
      label: "الاستعلام",
      render: (value: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {value?.substring(0, 80) || 'غير متوفر'}...
        </code>
      )
    },
    {
      key: "execution_time_ms",
      label: "وقت التنفيذ",
      render: (value: number) => (
        <Badge variant={value > 1000 ? "destructive" : value > 500 ? "outline" : "secondary"}>
          {value?.toFixed(0) || 0} ms
        </Badge>
      )
    },
  ];

  // تحديد لون البطاقة حسب القيمة
  const getPageLoadVariant = () => {
    if (latestMetrics.pageLoad > 3) return "destructive" as const;
    if (latestMetrics.pageLoad > 1.5) return "warning" as const;
    return "success" as const;
  };

  const getApiVariant = () => {
    if (latestMetrics.apiResponse > 1) return "destructive" as const;
    if (latestMetrics.apiResponse > 0.5) return "warning" as const;
    return "success" as const;
  };

  const getDbVariant = () => {
    if (latestMetrics.dbQuery > 0.5) return "destructive" as const;
    if (latestMetrics.dbQuery > 0.2) return "warning" as const;
    return "success" as const;
  };

  const getMemoryVariant = () => {
    if (latestMetrics.memoryUsage > 80) return "destructive" as const;
    if (latestMetrics.memoryUsage > 60) return "warning" as const;
    return "success" as const;
  };

  return (
    <div className="container-custom py-6 space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="لوحة الأداء"
        description="مراقبة أداء النظام في الوقت الحقيقي"
      />

      {/* شريط المعلومات */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>البيانات تُحدّث تلقائياً كل 5 ثوانٍ</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 me-2" />
          تحديث
        </Button>
      </div>

      {/* مقاييس الأداء الرئيسية */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="تحميل الصفحة"
          value={latestMetrics.pageLoad > 0 ? `${latestMetrics.pageLoad.toFixed(2)}s` : "قياس..."}
          subtitle={latestMetrics.pageLoad > 0 ? (latestMetrics.pageLoad < 1.5 ? "سريع" : latestMetrics.pageLoad < 3 ? "مقبول" : "بطيء") : undefined}
          icon={Zap}
          variant={getPageLoadVariant()}
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استجابة API"
          value={latestMetrics.apiResponse > 0 ? `${(latestMetrics.apiResponse * 1000).toFixed(0)}ms` : "قياس..."}
          subtitle={latestMetrics.apiResponse > 0 ? (latestMetrics.apiResponse < 0.5 ? "ممتاز" : latestMetrics.apiResponse < 1 ? "جيد" : "يحتاج تحسين") : undefined}
          icon={Activity}
          variant={getApiVariant()}
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استعلام DB"
          value={latestMetrics.dbQuery > 0 ? `${(latestMetrics.dbQuery * 1000).toFixed(0)}ms` : "قياس..."}
          subtitle={latestMetrics.dbQuery > 0 ? (latestMetrics.dbQuery < 0.2 ? "سريع" : latestMetrics.dbQuery < 0.5 ? "مقبول" : "بطيء") : undefined}
          icon={Database}
          variant={getDbVariant()}
          loading={isLoading}
        />
        <UnifiedKPICard
          title="استخدام الذاكرة"
          value={latestMetrics.memoryUsage > 0 ? `${latestMetrics.memoryUsage.toFixed(1)}%` : "غير متاح"}
          subtitle={latestMetrics.memoryUsage > 0 ? (latestMetrics.memoryUsage < 60 ? "جيد" : latestMetrics.memoryUsage < 80 ? "مرتفع" : "حرج") : "Chrome فقط"}
          icon={MemoryStick}
          variant={getMemoryVariant()}
          loading={isLoading}
        />
      </UnifiedStatsGrid>

      {/* مقاييس Core Web Vitals */}
      {(diagnostics.firstContentfulPaint > 0 || diagnostics.largestContentfulPaint > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>مقاييس Google لتجربة المستخدم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {diagnostics.domContentLoaded > 0 ? `${diagnostics.domContentLoaded.toFixed(2)}s` : '-'}
                </div>
                <div className="text-xs text-muted-foreground">DOM Ready</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${diagnostics.firstContentfulPaint < 1.8 ? 'text-green-600' : diagnostics.firstContentfulPaint < 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {diagnostics.firstContentfulPaint > 0 ? `${diagnostics.firstContentfulPaint.toFixed(2)}s` : '-'}
                </div>
                <div className="text-xs text-muted-foreground">FCP (First Paint)</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${diagnostics.largestContentfulPaint < 2.5 ? 'text-green-600' : diagnostics.largestContentfulPaint < 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {diagnostics.largestContentfulPaint > 0 ? `${diagnostics.largestContentfulPaint.toFixed(2)}s` : '-'}
                </div>
                <div className="text-xs text-muted-foreground">LCP (Largest Paint)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الاستعلامات البطيئة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            الاستعلامات البطيئة
            <Badge variant="outline">{slowQueries.length}</Badge>
          </CardTitle>
          <CardDescription>الاستعلامات التي تحتاج إلى تحسين (أكثر من 500ms)</CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={slowQueries}
            loading={isLoading}
            emptyMessage="🎉 لا توجد استعلامات بطيئة - الأداء ممتاز!"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
