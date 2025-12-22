import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAccountDistribution } from "@/hooks/dashboard/useAccountDistribution";
import { ErrorState } from "@/components/shared/ErrorState";
import { useIsMobile } from "@/hooks/ui/use-mobile";

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Default fill for Pie charts (overridden by Cell)
const DEFAULT_FILL = 'hsl(var(--primary))';

const AccountDistributionChart = () => {
  const { data, isLoading, error, refetch } = useAccountDistribution();
  const isMobile = useIsMobile();

  // Responsive chart dimensions
  const chartHeight = isMobile ? 200 : 300;
  const outerRadius = isMobile ? 60 : 80;

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
    return <ErrorState title="خطأ في تحميل توزيع الحسابات" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-xl font-bold">توزيع الحسابات حسب النوع</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data as { name: string; value: number; count: number; [key: string]: string | number }[] || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={!isMobile ? (props) => {
                const name = props.name || '';
                const percent = props.percent || 0;
                return `${name} ${(percent * 100).toFixed(0)}%`;
              } : false}
              outerRadius={outerRadius}
              fill={DEFAULT_FILL}
              dataKey="value"
            >
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl',
              }}
              formatter={(value: number, name: string) => [`${value} حساب`, name]}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl', paddingTop: '10px' }}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AccountDistributionChart;
