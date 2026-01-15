import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useBudgetComparison } from "@/hooks/dashboard/useDashboardCharts";
import { ErrorState } from "@/components/shared/ErrorState";
import { useIsMobile } from "@/hooks/ui/use-mobile";

const BudgetComparisonChart = () => {
  const { data, isLoading, error, refetch } = useBudgetComparison();
  const isMobile = useIsMobile();

  // Responsive chart dimensions
  const chartHeight = isMobile ? 200 : 300;
  const fontSize = isMobile ? '8px' : '11px';
  const yAxisFontSize = isMobile ? '9px' : '12px';
  const xAxisHeight = isMobile ? 60 : 80;
  const yAxisWidth = isMobile ? 35 : 60;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل مقارنة الميزانيات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-bold">مقارنة الميزانيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            لا توجد بيانات ميزانيات متاحة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-xl font-bold">مقارنة الميزانيات</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', minHeight: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="account" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize }}
              angle={-45}
              textAnchor="end"
              height={xAxisHeight}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: yAxisFontSize }}
              width={yAxisWidth}
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
              formatter={(value) => {
                const labels: Record<string, string> = {
                  budgeted: 'المخطط',
                  actual: 'الفعلي',
                };
                return labels[value] || value;
              }}
            />
              <Bar dataKey="budgeted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetComparisonChart;
