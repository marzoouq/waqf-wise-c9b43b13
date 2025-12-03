/**
 * لوحة تحليل الأداء المتقدمة
 * تعرض تحليل شامل للأداء مع توصيات تحسين
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  Package,
  MemoryStick,
  Layers,
  Clock,
  TrendingUp,
  ArrowRight,
  FileWarning,
  Gauge,
} from "lucide-react";
import { useAdvancedPerformanceAnalyzer, type PerformanceIssue } from "@/hooks/developer/useAdvancedPerformanceAnalyzer";

export function AdvancedPerformancePanel() {
  const { report, isAnalyzing, runAnalysis } = useAdvancedPerformanceAnalyzer(true);

  // الحصول على لون الدرجة
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500 bg-green-500/10 border-green-500';
      case 'B': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      case 'C': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'D': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'F': return 'text-red-500 bg-red-500/10 border-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // الحصول على أيقونة الشدة
  const getSeverityIcon = (severity: PerformanceIssue['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    }
  };

  // الحصول على شارة الشدة
  const getSeverityBadge = (severity: PerformanceIssue['severity']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500',
    };
    const labels = {
      critical: 'حرج',
      high: 'مرتفع',
      medium: 'متوسط',
      low: 'منخفض',
    };
    return <Badge className={colors[severity]}>{labels[severity]}</Badge>;
  };

  // الحصول على أيقونة الفئة
  const getCategoryIcon = (category: PerformanceIssue['category']) => {
    switch (category) {
      case 'lcp': return <Gauge className="h-4 w-4" />;
      case 'cls': return <Layers className="h-4 w-4" />;
      case 'network': return <Globe className="h-4 w-4" />;
      case 'bundle': return <Package className="h-4 w-4" />;
      case 'memory': return <MemoryStick className="h-4 w-4" />;
      case 'script': return <Zap className="h-4 w-4" />;
      case 'render': return <Layers className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // تنسيق الحجم
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // تنسيق الوقت
  const formatTime = (ms: number | null) => {
    if (ms === null) return '—';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // الحصول على لون المقياس
  const getMetricColor = (value: number | null, good: number, poor: number, inverse: boolean = false) => {
    if (value === null) return 'text-muted-foreground';
    if (inverse) {
      if (value <= good) return 'text-green-500';
      if (value <= poor) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (value <= good) return 'text-green-500';
    if (value <= poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* ملخص النتيجة */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${report ? getGradeColor(report.grade) : ''}`}>
                {report?.grade ?? '—'}
              </div>
              <p className="text-sm text-muted-foreground">درجة الأداء</p>
              <div className="mt-2">
                <Progress value={report?.score ?? 0} className="h-2" />
                <p className="text-xs mt-1">{report?.score ?? 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-5 w-5 text-primary" />
              <span className="font-medium">LCP</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(report?.metrics.lcp ?? null, 2500, 4000)}`}>
              {formatTime(report?.metrics.lcp ?? null)}
            </div>
            <p className="text-xs text-muted-foreground">الهدف: &lt; 2.5s</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-5 w-5 text-primary" />
              <span className="font-medium">CLS</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(report?.metrics.cls ?? null, 0.1, 0.25)}`}>
              {report?.metrics.cls?.toFixed(3) ?? '—'}
            </div>
            <p className="text-xs text-muted-foreground">الهدف: &lt; 0.1</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">مهام طويلة</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(report?.metrics.longTasksCount ?? 0, 5, 10)}`}>
              {report?.metrics.longTasksCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">الهدف: &lt; 5</p>
          </CardContent>
        </Card>
      </div>

      {/* مقاييس إضافية */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">FCP</p>
            <p className={`text-lg font-bold ${getMetricColor(report?.metrics.fcp ?? null, 1800, 3000)}`}>
              {formatTime(report?.metrics.fcp ?? null)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">TTFB</p>
            <p className={`text-lg font-bold ${getMetricColor(report?.metrics.ttfb ?? null, 800, 1800)}`}>
              {formatTime(report?.metrics.ttfb ?? null)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">TBT</p>
            <p className={`text-lg font-bold ${getMetricColor(report?.metrics.tbt ?? null, 200, 600)}`}>
              {formatTime(report?.metrics.tbt ?? null)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">حجم DOM</p>
            <p className={`text-lg font-bold ${getMetricColor(report?.metrics.domSize ?? 0, 1500, 3000)}`}>
              {report?.metrics.domSize ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">الذاكرة</p>
            <p className={`text-lg font-bold ${getMetricColor(report?.metrics.jsHeapSize ?? null, 50 * 1024 * 1024, 100 * 1024 * 1024)}`}>
              {report?.metrics.jsHeapSize ? formatSize(report.metrics.jsHeapSize) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">إجمالي الموارد</p>
            <p className="text-lg font-bold">
              {formatSize(report?.metrics.totalTransferSize ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* زر التحليل */}
      <Button onClick={runAnalysis} disabled={isAnalyzing} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        {isAnalyzing ? 'جاري التحليل...' : 'إعادة التحليل'}
      </Button>

      {/* التوصيات */}
      {report?.recommendations && report.recommendations.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              توصيات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* المشاكل المكتشفة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            المشاكل المكتشفة ({report?.issues.length ?? 0})
          </CardTitle>
          <CardDescription>
            آخر تحليل: {report?.timestamp?.toLocaleString('ar-SA') ?? 'لم يتم'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!report?.issues || report.issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>لا توجد مشاكل أداء حرجة</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Accordion type="multiple" className="space-y-2">
                {report.issues.map((issue) => (
                  <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-right w-full">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getSeverityBadge(issue.severity)}
                            <Badge variant="outline" className="gap-1">
                              {getCategoryIcon(issue.category)}
                              {issue.category}
                            </Badge>
                          </div>
                          <p className="font-medium mt-1">{issue.title}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">الوصف:</p>
                          <p className="text-sm">{issue.description}</p>
                        </div>
                        
                        {issue.affectedResource && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">المورد المتأثر:</p>
                            <code className="text-xs bg-muted px-2 py-1 rounded" dir="ltr">
                              {issue.affectedResource}
                            </code>
                          </div>
                        )}

                        {issue.currentValue !== undefined && issue.targetValue !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">القيمة:</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                {issue.unit === 'ms' ? formatTime(issue.currentValue) : 
                                 issue.unit === 'bytes' ? formatSize(issue.currentValue) : 
                                 issue.currentValue}
                              </Badge>
                              <ArrowRight className="h-4 w-4" />
                              <Badge variant="secondary">
                                الهدف: {issue.unit === 'ms' ? formatTime(issue.targetValue) : 
                                       issue.unit === 'bytes' ? formatSize(issue.targetValue) : 
                                       issue.targetValue}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">التأثير:</p>
                          <p className="text-sm text-orange-600">{issue.impact}</p>
                        </div>

                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-sm font-medium text-green-600">💡 التوصية:</p>
                          <p className="text-sm">{issue.recommendation}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* الموارد البطيئة والكبيرة */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* الموارد البطيئة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              أبطأ الموارد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report?.slowResources && report.slowResources.length > 0 ? (
              <div className="space-y-2">
                {report.slowResources.slice(0, 5).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border text-sm">
                    <code className="truncate max-w-[60%]" dir="ltr">
                      {resource.name.split('/').pop()}
                    </code>
                    <Badge variant={resource.duration > 3000 ? 'destructive' : 'secondary'}>
                      {formatTime(resource.duration)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">لا توجد موارد بطيئة</p>
            )}
          </CardContent>
        </Card>

        {/* الموارد الكبيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              أكبر الموارد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report?.largeResources && report.largeResources.length > 0 ? (
              <div className="space-y-2">
                {report.largeResources.slice(0, 5).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border text-sm">
                    <code className="truncate max-w-[60%]" dir="ltr">
                      {resource.name.split('/').pop()}
                    </code>
                    <Badge variant={resource.transferSize > 500 * 1024 ? 'destructive' : 'secondary'}>
                      {formatSize(resource.transferSize)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">لا توجد موارد كبيرة</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
