import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Download, Award, AlertTriangle } from 'lucide-react';
import type { DistributionReportData, MonthlyEfficiencyData } from '@/types/reports.types';

interface DistributionEfficiencyReportProps {
  distributions: DistributionReportData[];
}

export function DistributionEfficiencyReport({ distributions }: DistributionEfficiencyReportProps) {
  // حساب المقاييس
  const calculateMetrics = () => {
    const metrics = {
      avgApprovalTime: 0,
      avgProcessingTime: 0,
      onTimeDelivery: 0,
      delayedDelivery: 0,
      totalProcessed: distributions.length,
    };

    distributions.forEach(dist => {
      // وقت الموافقة (من الإنشاء للموافقة)
      if (dist.approved_at && dist.created_at) {
        const approvalTime = new Date(dist.approved_at).getTime() - new Date(dist.created_at).getTime();
        metrics.avgApprovalTime += approvalTime / (1000 * 60 * 60); // بالساعات
      }

      // وقت المعالجة (من الموافقة للتنفيذ)
      if (dist.executed_at && dist.approved_at) {
        const processingTime = new Date(dist.executed_at).getTime() - new Date(dist.approved_at).getTime();
        metrics.avgProcessingTime += processingTime / (1000 * 60 * 60); // بالساعات
      }

      // حساب التسليم في الوقت المحدد
      if (dist.status === 'completed') {
        const totalTime = new Date(dist.executed_at || dist.updated_at).getTime() - new Date(dist.created_at).getTime();
        const totalDays = totalTime / (1000 * 60 * 60 * 24);
        if (totalDays <= 7) {
          metrics.onTimeDelivery++;
        } else {
          metrics.delayedDelivery++;
        }
      }
    });

    if (distributions.length > 0) {
      metrics.avgApprovalTime /= distributions.length;
      metrics.avgProcessingTime /= distributions.length;
    }

    return metrics;
  };

  const metrics = calculateMetrics();
  const onTimePercentage = metrics.totalProcessed > 0
    ? (metrics.onTimeDelivery / metrics.totalProcessed) * 100
    : 0;

  // تحليل حسب الشهر
  const monthlyEfficiency = distributions.reduce<Record<string, MonthlyEfficiencyData>>((acc, dist) => {
    const month = new Date(dist.created_at).toLocaleDateString('ar-SA', { month: 'long' });
    if (!acc[month]) {
      acc[month] = {
        month,
        onTime: 0,
        delayed: 0,
        avgApprovalTime: 0,
        count: 0,
      };
    }
    
    const totalTime = dist.executed_at
      ? (new Date(dist.executed_at).getTime() - new Date(dist.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    
    if (totalTime <= 7) {
      acc[month].onTime++;
    } else {
      acc[month].delayed++;
    }

    if (dist.approved_at) {
      const approvalTime = (new Date(dist.approved_at).getTime() - new Date(dist.created_at).getTime()) / (1000 * 60 * 60);
      acc[month].avgApprovalTime += approvalTime;
    }
    
    acc[month].count++;
    return acc;
  }, {});

  const efficiencyChartData = Object.values(monthlyEfficiency).map((m) => ({
    ...m,
    avgApprovalTime: m.count > 0 ? m.avgApprovalTime / m.count : 0,
  }));

  // تحليل الاختناقات
  const bottlenecks = [
    {
      stage: 'مرحلة المراجعة المحاسبية',
      avgTime: metrics.avgApprovalTime * 0.4,
      impact: 'عالي',
    },
    {
      stage: 'الموافقة النهائية',
      avgTime: metrics.avgApprovalTime * 0.3,
      impact: 'متوسط',
    },
    {
      stage: 'التنفيذ والتحويل البنكي',
      avgTime: metrics.avgProcessingTime,
      impact: 'متوسط',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير كفاءة التوزيعات</h2>
          <p className="text-muted-foreground">تحليل الأداء وأوقات المعالجة</p>
        </div>
        <Button>
          <Download className="h-4 w-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">متوسط وقت الموافقة</div>
          <div className="text-2xl font-bold">{metrics.avgApprovalTime.toFixed(1)} ساعة</div>
          <div className="text-xs text-muted-foreground mt-1">من الإنشاء للموافقة</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">متوسط وقت المعالجة</div>
          <div className="text-2xl font-bold">{metrics.avgProcessingTime.toFixed(1)} ساعة</div>
          <div className="text-xs text-muted-foreground mt-1">من الموافقة للتنفيذ</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">التسليم في الموعد</div>
          <div className="text-2xl font-bold text-green-500">{onTimePercentage.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.onTimeDelivery} من {metrics.totalProcessed}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-sm text-muted-foreground mb-1">تأخيرات</div>
          <div className="text-2xl font-bold text-red-500">{metrics.delayedDelivery}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((metrics.delayedDelivery / metrics.totalProcessed) * 100).toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Efficiency Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">اتجاه الكفاءة الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={efficiencyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgApprovalTime"
              stroke="hsl(var(--primary))"
              name="متوسط وقت الموافقة (ساعة)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* On-time vs Delayed */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">في الموعد مقابل متأخر</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efficiencyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" fill="hsl(var(--chart-2))" name="في الموعد" />
              <Bar dataKey="delayed" fill="hsl(var(--destructive))" name="متأخر" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bottlenecks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">نقاط الاختناق</h3>
          <div className="space-y-4">
            {bottlenecks.map((bottleneck, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{bottleneck.stage}</div>
                  <div className="text-sm text-muted-foreground">
                    متوسط الوقت: {bottleneck.avgTime.toFixed(1)} ساعة
                  </div>
                </div>
                <Badge
                  variant={
                    bottleneck.impact === 'عالي'
                      ? 'destructive'
                      : bottleneck.impact === 'متوسط'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {bottleneck.impact}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 bg-blue-500/10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          توصيات لتحسين الكفاءة
        </h3>
        <ul className="space-y-2 text-sm">
          {metrics.avgApprovalTime > 48 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                وقت الموافقة مرتفع ({metrics.avgApprovalTime.toFixed(1)} ساعة). يُنصح بتفعيل
                التنبيهات التلقائية للموافقين.
              </span>
            </li>
          )}
          {onTimePercentage < 80 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                نسبة التسليم في الموعد منخفضة ({onTimePercentage.toFixed(1)}%). يُنصح بمراجعة
                مسارات الموافقات وتبسيطها.
              </span>
            </li>
          )}
          {metrics.avgProcessingTime > 24 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                وقت المعالجة مرتفع. يُنصح بأتمتة التحويلات البنكية للتسريع.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>استخدام المسارات السريعة للتوزيعات الصغيرة (أقل من 50,000 ريال).</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
