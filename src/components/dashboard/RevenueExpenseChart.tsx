import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRevenueExpenseChart } from "@/hooks/dashboard/useDashboardCharts";

const RevenueExpenseChart = () => {
  const { data, isLoading } = useRevenueExpenseChart();

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full shadow-soft">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-xl font-bold">الإيرادات والمصروفات الشهرية</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
          <AreaChart data={data || []}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: window.innerWidth < 640 ? '9px' : '12px' }}
              angle={window.innerWidth < 640 ? -45 : 0}
              textAnchor={window.innerWidth < 640 ? "end" : "middle"}
              height={window.innerWidth < 640 ? 60 : 30}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: window.innerWidth < 640 ? '9px' : '12px' }}
              width={window.innerWidth < 640 ? 40 : 60}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [
                new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                }).format(value),
              ]}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl', paddingTop: '10px' }}
              formatter={(value) => value === 'revenue' ? 'الإيرادات' : 'المصروفات'}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;
