/**
 * مكون الرسم البياني لتاريخ الاختبارات
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { TestRun } from '@/hooks/tests/useTestHistory';

interface TestHistoryChartProps {
  history: TestRun[];
  trend: 'improving' | 'declining' | 'stable' | 'unknown';
}

export function TestHistoryChart({ history, trend }: TestHistoryChartProps) {
  const chartData = useMemo(() => {
    return history
      .slice(0, 15)
      .reverse()
      .map((run, index) => ({
        name: new Date(run.run_date).toLocaleDateString('ar-SA', { 
          month: 'short', 
          day: 'numeric' 
        }),
        passRate: Number(run.pass_rate),
        passed: run.passed_tests,
        failed: run.failed_tests,
        avgDuration: run.avg_duration,
        total: run.total_tests,
        index,
      }));
  }, [history]);

  const TrendIcon = trend === 'improving' 
    ? TrendingUp 
    : trend === 'declining' 
      ? TrendingDown 
      : Minus;

  const trendColor = trend === 'improving' 
    ? 'text-green-500' 
    : trend === 'declining' 
      ? 'text-red-500' 
      : 'text-yellow-500';

  const trendLabel = trend === 'improving' 
    ? 'تحسن' 
    : trend === 'declining' 
      ? 'تراجع' 
      : trend === 'stable'
        ? 'مستقر'
        : 'غير محدد';

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد بيانات تاريخية بعد</p>
            <p className="text-sm">قم بتشغيل الاختبارات لبدء التتبع</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* نسبة النجاح عبر الوقت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>تطور نسبة النجاح</span>
            <Badge variant="outline" className={trendColor}>
              <TrendIcon className="h-4 w-4 mr-1" />
              {trendLabel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                className="text-muted-foreground"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-primary">
                          نسبة النجاح: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="passRate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#passRateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* النجاح vs الفشل */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        <p className="text-green-500">نجح: {payload[0]?.value}</p>
                        <p className="text-red-500">فشل: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                formatter={(value) => value === 'passed' ? 'نجح' : 'فشل'}
              />
              <Bar dataKey="passed" fill="#10B981" name="passed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#EF4444" name="failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* متوسط الزمن */}
      <Card>
        <CardHeader>
          <CardTitle>متوسط زمن الاستجابة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}ms`}
                className="text-muted-foreground"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-orange-500">
                          متوسط الزمن: {payload[0].value}ms
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="avgDuration" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
