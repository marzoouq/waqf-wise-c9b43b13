import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { usePOSTransactions } from "@/hooks/pos/usePOSTransactions";
import { format, subDays, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";
import { FileDown, RefreshCw, CreditCard, Banknote, Building2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { exportToExcel } from "@/lib/excel-helper";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = {
  نقدي: "hsl(var(--status-success))",
  شبكة: "hsl(var(--primary))",
  تحويل: "hsl(var(--status-info))",
  شيك: "hsl(var(--status-warning))",
};

export const POSPaymentMethodsReport = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { transactions, isLoading, refetch } = usePOSTransactions(null);

  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.created_at);
    return (
      dateRange.from &&
      dateRange.to &&
      isWithinInterval(txDate, { start: dateRange.from, end: dateRange.to })
    );
  });

  const paymentMethodStats = filteredTransactions.reduce(
    (acc, t) => {
      const method = t.payment_method || "أخرى";
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += t.amount;
      return acc;
    },
    {} as Record<string, { count: number; amount: number }>
  );

  const chartData = Object.entries(paymentMethodStats).map(([name, data]) => ({
    name,
    value: data.amount,
    count: data.count,
  }));

  const totalAmount = chartData.reduce((sum, d) => sum + d.value, 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  const handleExport = async () => {
    const data = Object.entries(paymentMethodStats).map(([method, stats]) => ({
      "طريقة الدفع": method,
      "عدد العمليات": stats.count,
      "إجمالي المبلغ": stats.amount,
      "النسبة %": ((stats.amount / totalAmount) * 100).toFixed(1),
    }));

    await exportToExcel(data, "تحليل طرق الدفع", "payment-methods-report");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "نقدي":
        return <Banknote className="h-5 w-5" />;
      case "شبكة":
        return <CreditCard className="h-5 w-5" />;
      case "تحويل":
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">تحليل طرق الدفع</CardTitle>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 ms-1" />
            تصدير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد عمليات في هذه الفترة
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.name as keyof typeof COLORS] ||
                          `hsl(${index * 60}, 70%, 50%)`
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `${value.toLocaleString("ar-SA")} ريال`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">إجمالي العمليات</span>
                  <span className="text-2xl font-bold">{totalCount}</span>
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">إجمالي المبالغ</span>
                  <span className="text-2xl font-bold">
                    {totalAmount.toLocaleString("ar-SA")} ريال
                  </span>
                </div>
              </Card>

              {/* Method Breakdown */}
              <div className="space-y-3">
                {Object.entries(paymentMethodStats).map(([method, stats]) => (
                  <Card key={method} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(method)}
                        <span className="font-medium">{method}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">
                          {stats.amount.toLocaleString("ar-SA")} ريال
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.count} عملية (
                          {((stats.amount / totalAmount) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
