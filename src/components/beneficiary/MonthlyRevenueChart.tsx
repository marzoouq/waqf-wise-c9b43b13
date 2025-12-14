import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EyeOff } from "lucide-react";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";
import { useMonthlyRevenue } from "@/hooks/beneficiary/useBeneficiaryTabsData";

export function MonthlyRevenueChart() {
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();
  const { data = [], isLoading, error, refetch } = useMonthlyRevenue();

  if (!publishStatusLoading && !isCurrentYearPublished) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <EyeOff className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">الرسم البياني مخفي</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          بيانات الإيرادات الشهرية مخفية حتى يتم نشر السنة المالية من قبل الناظر
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) return <LoadingState message="جاري تحميل البيانات..." />;

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>لا توجد بيانات إيرادات لعرضها</p>
      </Card>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
            labelStyle={{ direction: 'rtl' }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" name="الإيرادات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
