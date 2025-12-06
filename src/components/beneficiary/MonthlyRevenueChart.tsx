import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LoadingState } from "@/components/shared/LoadingState";
import { EyeOff } from "lucide-react";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export function MonthlyRevenueChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();

  // إذا لم تكن السنة منشورة، نعرض رسالة
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

  useEffect(() => {
    const fetchRevenue = async () => {
      // الحصول على آخر 12 شهر من المدفوعات
      const { data: payments, error } = await supabase
        .from("rental_payments")
        .select("payment_date, amount_due")
        .eq("status", "مدفوع")
        .order("payment_date", { ascending: false })
        .limit(200);

      if (!error && payments) {
        // تجميع البيانات حسب الشهر
        const monthlyData: { [key: string]: number } = {};
        
        payments.forEach((payment) => {
          const date = new Date(payment.payment_date);
          const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += Number(payment.amount_due);
        });

        // تحويل إلى مصفوفة للرسم البياني
        const chartData = Object.entries(monthlyData)
          .map(([month, revenue]) => ({
            month,
            revenue: Math.round(revenue),
          }));
        
        // حماية من المصفوفات الفارغة
        if (chartData.length > 0) {
          const sortedData = [...chartData].reverse().slice(-12);
          setData(sortedData);
        } else {
          setData([]);
        }
      }
      setLoading(false);
    };

    fetchRevenue();
  }, []);

  if (loading) return <LoadingState message="جاري تحميل البيانات..." />;

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
