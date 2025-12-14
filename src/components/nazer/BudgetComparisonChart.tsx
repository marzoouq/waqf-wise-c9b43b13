/**
 * BudgetComparisonChart - رسم بياني لمقارنة الميزانية
 * @version 2.8.79
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { useBudgetComparison } from "@/hooks/dashboard/useDashboardCharts";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function BudgetComparisonChart() {
  const { data, isLoading, error, refetch } = useBudgetComparison();

  if (isLoading) {
    return <ChartSkeleton title="مقارنة الميزانية" />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل مقارنة الميزانية" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base">مقارنة الميزانية بالفعلي</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center px-0">
          <p className="text-muted-foreground">لا توجد بيانات ميزانية متاحة</p>
        </CardContent>
      </Card>
    );
  }

  // تحويل البيانات مع حساب الفرق
  const chartData = data.map(item => ({
    ...item,
    variance: item.budgeted - item.actual,
    variancePercent: item.budgeted > 0 ? ((item.actual / item.budgeted) * 100).toFixed(1) : 0
  }));

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base">مقارنة الميزانية بالفعلي</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              className="text-muted-foreground text-xs"
            />
            <YAxis 
              type="category" 
              dataKey="account" 
              width={120}
              className="text-muted-foreground text-xs"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('ar-SA')} ر.س`,
                name === 'budgeted' ? 'المخطط' : 'الفعلي'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend 
              formatter={(value) => value === 'budgeted' ? 'المخطط' : 'الفعلي'}
            />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
            <Bar dataKey="budgeted" fill="hsl(var(--primary))" name="budgeted" radius={[0, 4, 4, 0]} />
            <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="actual" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
