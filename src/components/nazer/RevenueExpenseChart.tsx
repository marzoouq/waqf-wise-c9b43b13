/**
 * RevenueExpenseChart - رسم بياني للإيرادات والمصروفات
 * @version 2.8.79
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useRevenueExpenseChart } from "@/hooks/dashboard/useDashboardCharts";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

export default function RevenueExpenseChart() {
  const { data, isLoading } = useRevenueExpenseChart();

  if (isLoading) {
    return <ChartSkeleton title="الإيرادات والمصروفات" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base">الإيرادات والمصروفات الشهرية</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center px-0">
          <p className="text-muted-foreground">لا توجد بيانات مالية متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base">الإيرادات والمصروفات الشهرية</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-muted-foreground text-xs"
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              className="text-muted-foreground text-xs"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('ar-SA')} ر.س`,
                name === 'revenue' ? 'الإيرادات' : 'المصروفات'
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend 
              formatter={(value) => value === 'revenue' ? 'الإيرادات' : 'المصروفات'}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--chart-1))" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="revenue"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="hsl(var(--chart-4))" 
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              name="expense"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
