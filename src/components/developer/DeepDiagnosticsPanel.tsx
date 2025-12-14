/**
 * لوحة التشخيص العميق
 * واجهة شاملة لفحص جميع أجزاء التطبيق
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Layers,
  Zap
} from 'lucide-react';
import { useDeepDiagnostics } from '@/hooks/developer/useDeepDiagnostics';
import { useMemoryMonitor } from '@/hooks/developer/useMemoryMonitor';
import { usePerformanceGuard } from '@/hooks/developer/usePerformanceGuard';

const categoryIcons: Record<string, React.ReactNode> = {
  'قاعدة البيانات': <Database className="h-4 w-4" />,
  'الذاكرة': <Cpu className="h-4 w-4" />,
  'React': <Layers className="h-4 w-4" />,
  'الأداء': <Zap className="h-4 w-4" />,
  'الشبكة': <Globe className="h-4 w-4" />,
  'التخزين': <HardDrive className="h-4 w-4" />,
  'Service Worker': <Activity className="h-4 w-4" />,
  'الأخطاء': <AlertTriangle className="h-4 w-4" />,
  'Bundle': <Layers className="h-4 w-4" />,
  'React Query': <Database className="h-4 w-4" />,
};

export function DeepDiagnosticsPanel() {
  const { runDiagnostics, isRunning, report, progress } = useDeepDiagnostics();
  const { memoryInfo, trend } = useMemoryMonitor(true, 5000);
  const { metrics } = usePerformanceGuard(true);

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">نجح</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-black">تحذير</Badge>;
      case 'fail':
        return <Badge variant="destructive">فشل</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس اللوحة */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                التشخيص العميق
              </CardTitle>
              <CardDescription>
                فحص شامل لجميع أجزاء التطبيق للكشف عن المشاكل المخفية
              </CardDescription>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري الفحص...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 ml-2" />
                  بدء الفحص الشامل
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isRunning && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري الفحص...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* المراقبة الحية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* مراقبة الذاكرة */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              الذاكرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memoryInfo ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {memoryInfo.usagePercentage.toFixed(1)}%
                </div>
                <Progress 
                  value={memoryInfo.usagePercentage} 
                  className={`h-2 ${
                    memoryInfo.usagePercentage > 85 ? 'bg-red-200' :
                    memoryInfo.usagePercentage > 70 ? 'bg-yellow-200' : ''
                  }`}
                />
                <div className="text-xs text-muted-foreground">
                  الاتجاه: {trend === 'increasing' ? '📈 متزايد' : trend === 'decreasing' ? '📉 متناقص' : '➡️ مستقر'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">غير مدعوم</div>
            )}
          </CardContent>
        </Card>

        {/* مراقبة الأداء */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className={metrics.lcp && metrics.lcp > 2500 ? 'text-yellow-500' : ''}>
                  {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CLS:</span>
                <span className={metrics.cls && metrics.cls > 0.1 ? 'text-yellow-500' : ''}>
                  {metrics.cls?.toFixed(3) || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Long Tasks:</span>
                <span className={metrics.longTasks > 5 ? 'text-yellow-500' : ''}>
                  {metrics.longTasks}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* حالة النظام */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {report.summary.score}%
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-500">✓ {report.summary.passed}</span>
                  <span className="text-yellow-500">⚠ {report.summary.warnings}</span>
                  <span className="text-red-500">✗ {report.summary.failed}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                اضغط "بدء الفحص" للتحقق
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* نتائج الفحص */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>نتائج الفحص</span>
              <Badge variant={
                report.summary.score >= 90 ? 'default' :
                report.summary.score >= 70 ? 'secondary' : 'destructive'
              }>
                {report.summary.score >= 90 ? 'ممتاز' :
                 report.summary.score >= 70 ? 'جيد' :
                 report.summary.score >= 50 ? 'متوسط' : 'ضعيف'}
              </Badge>
            </CardTitle>
            <CardDescription>
              تم فحص {report.results.length} عنصر في {new Date(report.timestamp).toLocaleTimeString('ar-SA')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {report.results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'fail' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                      result.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                      'border-green-200 bg-green-50 dark:bg-green-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex items-center gap-2">
                          {categoryIcons[result.category]}
                          <span className="font-medium">{result.category}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{result.name}</span>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 me-7">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2 me-7">
                        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          عرض التفاصيل
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
