import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useDistributionChartData } from "@/hooks/beneficiary/useBeneficiaryTabsData";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(142, 76%, 36%)',
  'hsl(47, 96%, 53%)',
  'hsl(280, 65%, 60%)',
];

export function DistributionPieChart() {
  const { data = [], isLoading, error, refetch } = useDistributionChartData();

  if (isLoading) return <LoadingState message="جاري تحميل البيانات..." />;

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل بيانات التوزيع" onRetry={refetch} />;
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>لا توجد بيانات توزيع لعرضها</p>
      </Card>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
