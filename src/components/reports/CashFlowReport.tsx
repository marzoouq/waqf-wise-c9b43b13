import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/shared/LoadingState";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export function CashFlowReport() {
  const { data: cashFlowData = [], isLoading } = useQuery({
    queryKey: ["cash-flow-report"],
    queryFn: async () => {
      // جلب البيانات من unified_transactions_view
      const { data, error } = await supabase
        .from("unified_transactions_view")
        .select("transaction_date, amount, transaction_type")
        .gte("transaction_date", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // تجميع البيانات حسب الشهر
      const monthlyData: Record<string, { income: number; expense: number }> = {};

      data.forEach((transaction) => {
        const month = new Date(transaction.transaction_date).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
        });

        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 };
        }

        if (transaction.transaction_type === "قبض") {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expense += transaction.amount;
        }
      });

      // تحويل إلى مصفوفة
      const chartData: CashFlowData[] = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }));

      return chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
    },
  });

  // حساب الإحصائيات
  const stats = {
    totalIncome: cashFlowData.reduce((sum, d) => sum + d.income, 0),
    totalExpense: cashFlowData.reduce((sum, d) => sum + d.expense, 0),
    netCashFlow: cashFlowData.reduce((sum, d) => sum + d.net, 0),
    avgMonthlyIncome: cashFlowData.length > 0 
      ? cashFlowData.reduce((sum, d) => sum + d.income, 0) / cashFlowData.length 
      : 0,
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalIncome.toLocaleString("ar-SA")} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط شهري: {stats.avgMonthlyIncome.toLocaleString("ar-SA")} ريال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.totalExpense.toLocaleString("ar-SA")} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netCashFlow >= 0 ? "text-success" : "text-destructive"}`}>
              {stats.netCashFlow.toLocaleString("ar-SA")} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسم البياني */}
      <Card>
        <CardHeader>
          <CardTitle>التدفقات النقدية الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString("ar-SA")} ريال`}
                labelStyle={{ textAlign: "right" }}
              />
              <Legend />
              <Bar dataKey="income" name="الإيرادات" fill="#22c55e" />
              <Bar dataKey="expense" name="المصروفات" fill="#ef4444" />
              <Bar dataKey="net" name="الصافي" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
