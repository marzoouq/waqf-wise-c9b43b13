import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useYearlyComparison } from "@/hooks/beneficiary/useBeneficiaryTabsData";

interface YearlyComparisonProps {
  beneficiaryId: string;
}

export function YearlyComparison({ beneficiaryId }: YearlyComparisonProps) {
  const { data: yearlyData, isLoading } = useYearlyComparison(beneficiaryId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مقارنة الأداء السنوي</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  const chartData = yearlyData?.map((item) => ({
    year: item.year,
    "إجمالي المدفوعات": item.total,
    "عدد المدفوعات": item.count,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          مقارنة الأداء السنوي
        </CardTitle>
        <CardDescription>مقارنة المدفوعات بين السنوات</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => value.toLocaleString("ar-SA")}
                labelStyle={{ direction: "rtl" }}
              />
              <Legend />
              <Bar dataKey="إجمالي المدفوعات" fill="hsl(var(--primary))" />
              <Bar dataKey="عدد المدفوعات" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8">لا توجد بيانات كافية للمقارنة</p>
        )}
      </CardContent>
    </Card>
  );
}
