import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/LoadingState";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ReportRefreshIndicator } from "./ReportRefreshIndicator";
import { useCashFlowReport } from "@/hooks/reports/useCashFlowReport";

export function CashFlowReport() {
  const { 
    data: cashFlowData = [], 
    isLoading, 
    isRefetching, 
    stats, 
    lastUpdated, 
    handleRefresh 
  } = useCashFlowReport();

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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>التدفقات النقدية الشهرية</CardTitle>
          <ReportRefreshIndicator
            lastUpdated={lastUpdated}
            isRefetching={isRefetching}
            onRefresh={handleRefresh}
          />
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
