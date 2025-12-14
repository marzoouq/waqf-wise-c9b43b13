import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentStats } from '@/hooks/useAgentAvailability';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TrendingUp, Clock, CheckCircle, Star, User } from 'lucide-react';

interface AgentPerformanceReportProps {
  userId?: string;
  dateRange?: { from: string; to: string };
}

export function AgentPerformanceReport({ userId, dateRange }: AgentPerformanceReportProps) {
  const { data: stats, isLoading, error, refetch } = useAgentStats(userId, dateRange);

  if (isLoading) {
    return <LoadingState message="جاري تحميل إحصائيات الأداء..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل إحصائيات الأداء" onRetry={refetch} />;
  }

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">لا توجد بيانات أداء</p>
        </CardContent>
      </Card>
    );
  }

  // حساب الإجماليات
  const totals = stats.reduce(
    (acc, day) => ({
      assigned: acc.assigned + (day.total_assigned || 0),
      resolved: acc.resolved + (day.total_resolved || 0),
      closed: acc.closed + (day.total_closed || 0),
      avgResponse: acc.avgResponse + (day.avg_response_minutes || 0),
      avgResolution: acc.avgResolution + (day.avg_resolution_minutes || 0),
      satisfaction: acc.satisfaction + (day.customer_satisfaction_avg || 0),
    }),
    { assigned: 0, resolved: 0, closed: 0, avgResponse: 0, avgResolution: 0, satisfaction: 0 }
  );

  const daysCount = stats.length;
  const avgResponse = daysCount > 0 ? totals.avgResponse / daysCount : 0;
  const avgResolution = daysCount > 0 ? totals.avgResolution / daysCount : 0;
  const avgSatisfaction = daysCount > 0 ? totals.satisfaction / daysCount : 0;
  const resolutionRate = totals.assigned > 0 ? (totals.resolved / totals.assigned) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التذاكر المُعيّنة</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.assigned}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي التذاكر المُعيّنة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التذاكر المحلولة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.resolved}</div>
            <p className="text-xs text-muted-foreground">
              معدل الحل: {resolutionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت الاستجابة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgResponse > 0 ? `${Math.round(avgResponse)} دقيقة` : 'غير متوفر'}
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط الحل: {avgResolution > 0 ? `${Math.round(avgResolution)} دقيقة` : 'غير متوفر'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgSatisfaction > 0 ? avgSatisfaction.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              من 5 نجوم
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأداء اليومي</CardTitle>
          <CardDescription>تفصيل الأداء خلال الفترة المختارة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.slice(0, 10).map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(day.date).toLocaleDateString('ar-SA')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {day.total_assigned} مُعيّن | {day.total_resolved} محلول
                  </p>
                </div>
                <div className="text-left">
                  {day.customer_satisfaction_avg && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="text-sm font-medium">
                        {day.customer_satisfaction_avg.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
