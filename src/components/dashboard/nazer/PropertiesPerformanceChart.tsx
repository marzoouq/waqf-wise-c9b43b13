import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { usePropertiesPerformance } from "@/hooks/dashboard/usePropertiesPerformance";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";

export default function PropertiesPerformanceChart() {
  const { data, isLoading, error, refetch } = usePropertiesPerformance();

  if (isLoading) {
    return <ChartSkeleton title="أداء العقارات" />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل أداء العقارات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>أداء العقارات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">لا توجد بيانات عقارات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>أداء العقارات (أعلى 6 عقارات)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
            />
            <Legend />
            <Bar dataKey="الإيرادات الكلية" fill="#8b5cf6" />
            <Bar dataKey="المدفوع" fill="#10b981" />
            <Bar dataKey="المعلق" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
