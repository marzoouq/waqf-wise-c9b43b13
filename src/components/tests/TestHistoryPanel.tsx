/**
 * مكون عرض سجل الاختبارات التاريخية مع الإحصائيات
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  History, Trash2, RefreshCw, TrendingUp, TrendingDown, 
  Minus, AlertTriangle, CheckCircle, XCircle, Clock,
  Calendar, BarChart3, Loader2
} from 'lucide-react';
import { useTestHistory, type TestRun } from '@/hooks/tests/useTestHistory';
import { TestHistoryChart } from './TestHistoryChart';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TestHistoryPanelProps {
  onSelectRun?: (run: TestRun) => void;
}

export function TestHistoryPanel({ onSelectRun }: TestHistoryPanelProps) {
  const { history, isLoading, stats, deleteRun, refetch } = useTestHistory();
  const [showChart, setShowChart] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const TrendIcon = stats.trend === 'improving' 
    ? TrendingUp 
    : stats.trend === 'declining' 
      ? TrendingDown 
      : Minus;

  const trendColor = stats.trend === 'improving' 
    ? 'text-green-500' 
    : stats.trend === 'declining' 
      ? 'text-red-500' 
      : 'text-yellow-500';

  const handleSelectRun = (run: TestRun) => {
    setSelectedRunId(run.id);
    onSelectRun?.(run);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التشغيلات</p>
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
              </div>
              <History className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط النجاح</p>
                <p className="text-2xl font-bold">{stats.avgPassRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الاتجاه</p>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                  <span className={`text-lg font-bold ${trendColor}`}>
                    {stats.trend === 'improving' ? 'تحسن' : 
                     stats.trend === 'declining' ? 'تراجع' : 
                     stats.trend === 'stable' ? 'مستقر' : '-'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أفضل نتيجة</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.bestRun ? `${stats.bestRun.pass_rate}%` : '-'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الإخفاقات المتكررة */}
      {stats.recentFailures.length > 0 && (
        <Card className="border-orange-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
              الاختبارات الأكثر فشلاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.recentFailures.map((failure, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-red-500 bg-red-500/10"
                >
                  {failure.testName} ({failure.count}x)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الرسوم البيانية */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          الرسوم البيانية
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChart(!showChart)}
        >
          {showChart ? 'إخفاء' : 'عرض'}
        </Button>
      </div>

      {showChart && (
        <TestHistoryChart history={history} trend={stats.trend} />
      )}

      {/* سجل التشغيلات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-5 w-5" />
              سجل التشغيلات ({history.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد سجلات بعد</p>
                <p className="text-sm">قم بتشغيل الاختبارات لبدء التتبع</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {history.map((run) => (
                  <AccordionItem 
                    key={run.id} 
                    value={run.id}
                    className={`border rounded-lg px-4 ${
                      selectedRunId === run.id ? 'border-primary' : ''
                    }`}
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full ml-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            Number(run.pass_rate) >= 90 ? 'bg-green-500' :
                            Number(run.pass_rate) >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <div className="text-right">
                            <div className="font-medium">
                              {new Date(run.run_date).toLocaleDateString('ar-SA')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(run.run_date), { 
                                addSuffix: true, 
                                locale: ar 
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={Number(run.pass_rate) >= 90 ? 'default' : 'destructive'}
                          >
                            {run.pass_rate}%
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <span className="text-green-500">{run.passed_tests}</span>
                            {' / '}
                            <span className="text-red-500">{run.failed_tests}</span>
                            {' / '}
                            {run.total_tests}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-4">
                        {/* تفاصيل */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>المدة: {run.run_duration_seconds}ث</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{run.triggered_by}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span>متوسط: {run.avg_duration}ms</span>
                          </div>
                        </div>

                        {/* الاختبارات الفاشلة */}
                        {run.failed_tests > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-red-500">
                              الاختبارات الفاشلة:
                            </h4>
                            <div className="space-y-1">
                              {(run.failed_tests_details as any[])?.slice(0, 5).map((test, i) => (
                                <div 
                                  key={i}
                                  className="flex items-center gap-2 p-2 bg-red-500/10 rounded text-sm"
                                >
                                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  <span className="flex-1 truncate">{test.testName}</span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {test.message}
                                  </span>
                                </div>
                              ))}
                              {(run.failed_tests_details as any[])?.length > 5 && (
                                <p className="text-xs text-muted-foreground">
                                  و {(run.failed_tests_details as any[]).length - 5} أخرى...
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* أزرار */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectRun(run)}
                          >
                            عرض التفاصيل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteRun(run.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
