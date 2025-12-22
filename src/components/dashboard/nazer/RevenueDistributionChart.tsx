import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRevenueDistribution } from "@/hooks/dashboard/useRevenueDistribution";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function RevenueDistributionChart() {
  const { data, isLoading, error, refetch } = useRevenueDistribution();

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--status-success))',
    'hsl(var(--status-warning))',
    'hsl(var(--status-error))',
    'hsl(var(--chart-5))',
  ];

  if (isLoading) {
    return <ChartSkeleton title="توزيع الإيرادات" />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل توزيع الإيرادات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإيرادات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">لا توجد بيانات إيرادات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع الإيرادات حسب المصدر</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => {
                const name = props.name || '';
                const percent = props.percent || 0;
                return `${name}: ${(percent * 100).toFixed(1)}%`;
              }}
              outerRadius={100}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
