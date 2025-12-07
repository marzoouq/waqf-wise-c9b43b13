import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePOSTransactions } from "@/hooks/pos/usePOSTransactions";
import { usePOSStats } from "@/hooks/pos/usePOSStats";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  FileDown,
  RefreshCw,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel-helper";

export const POSDailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { transactions, isLoading, refetch } = usePOSTransactions(null);
  const { dailyStats } = usePOSStats(selectedDate);

  const filteredTransactions = transactions.filter(
    (t) =>
      format(new Date(t.created_at), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  const handleExport = async () => {
    const data = filteredTransactions.map((t) => ({
      "رقم العملية": t.transaction_number,
      النوع: t.transaction_type,
      المبلغ: t.amount,
      "طريقة الدفع": t.payment_method,
      الاسم: t.payer_name || "-",
      الوصف: t.description || "-",
      الوقت: format(new Date(t.created_at), "HH:mm:ss"),
    }));

    await exportToExcel(
      data,
      `تقرير يومي - ${format(selectedDate, "yyyy-MM-dd")}`,
      "daily-pos-report"
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">التقرير اليومي</CardTitle>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "yyyy/MM/dd", { locale: ar })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ar}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 ml-1" />
            تصدير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-r-4 border-r-status-success">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-status-success" />
              <p className="text-sm text-muted-foreground">إجمالي التحصيل</p>
            </div>
            <p className="text-2xl font-bold text-status-success">
              {dailyStats.total_collections.toLocaleString("ar-SA")} ريال
            </p>
          </Card>
          <Card className="p-4 border-r-4 border-r-status-error">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-status-error" />
              <p className="text-sm text-muted-foreground">إجمالي الصرف</p>
            </div>
            <p className="text-2xl font-bold text-status-error">
              {dailyStats.total_payments.toLocaleString("ar-SA")} ريال
            </p>
          </Card>
          <Card className="p-4 border-r-4 border-r-primary">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">صافي العمليات</p>
            </div>
            <p className="text-2xl font-bold">
              {dailyStats.net_amount.toLocaleString("ar-SA")} ريال
            </p>
          </Card>
          <Card className="p-4 border-r-4 border-r-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">عدد العمليات</p>
            </div>
            <p className="text-2xl font-bold">{dailyStats.transactions_count}</p>
          </Card>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">نقدي</p>
            <p className="font-bold">
              {dailyStats.cash_amount.toLocaleString("ar-SA")}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">شبكة</p>
            <p className="font-bold">
              {dailyStats.card_amount.toLocaleString("ar-SA")}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">تحويل</p>
            <p className="font-bold">
              {dailyStats.transfer_amount.toLocaleString("ar-SA")}
            </p>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم العملية</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead className="text-left">المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الوقت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    لا توجد عمليات في هذا اليوم
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          transaction.transaction_type === "تحصيل"
                            ? "bg-status-success/20 text-status-success"
                            : "bg-status-error/20 text-status-error"
                        )}
                      >
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.payer_name || "-"}</TableCell>
                    <TableCell
                      className={cn(
                        "text-left font-semibold",
                        transaction.transaction_type === "تحصيل"
                          ? "text-status-success"
                          : "text-status-error"
                      )}
                    >
                      {transaction.amount.toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      {format(new Date(transaction.created_at), "HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
