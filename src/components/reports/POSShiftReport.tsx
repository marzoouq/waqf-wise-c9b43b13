import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDailySettlement } from "@/hooks/pos/useDailySettlement";
import { format, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import { FileDown, RefreshCw, Printer } from "lucide-react";
import { DateRange } from "react-day-picker";
import { exportToExcel } from "@/lib/excel-helper";

export const POSShiftReport = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { shiftsReport, isLoading, refetch, summary } = useDailySettlement(
    dateRange.from || new Date(),
    dateRange.to || new Date()
  );

  const handleExport = async () => {
    const data = shiftsReport.map((shift) => ({
      "رقم الوردية": shift.shift_number,
      "أمين الصندوق": shift.cashier_name || "-",
      "وقت الفتح": format(new Date(shift.opened_at), "yyyy/MM/dd HH:mm"),
      "وقت الإغلاق": shift.closed_at
        ? format(new Date(shift.closed_at), "yyyy/MM/dd HH:mm")
        : "-",
      "الرصيد الافتتاحي": shift.opening_balance,
      "الرصيد الختامي": shift.closing_balance || 0,
      "إجمالي التحصيل": shift.total_collections,
      "إجمالي الصرف": shift.total_payments,
      الفرق: shift.variance,
      الحالة: shift.status,
    }));

    await exportToExcel(data, "تقرير الورديات", "shifts-report");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مفتوحة":
        return "bg-status-success/20 text-status-success";
      case "مغلقة":
        return "bg-muted text-muted-foreground";
      case "معلقة":
        return "bg-status-warning/20 text-status-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">تقرير الورديات</CardTitle>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 ms-1" />
            تصدير
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 ms-1" />
            طباعة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">عدد الورديات</p>
            <p className="text-2xl font-bold">{summary.shiftsCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">إجمالي التحصيل</p>
            <p className="text-2xl font-bold text-status-success">
              {summary.totalCollections.toLocaleString("ar-SA")}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">إجمالي الصرف</p>
            <p className="text-2xl font-bold text-status-error">
              {summary.totalPayments.toLocaleString("ar-SA")}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">صافي العمليات</p>
            <p className="text-2xl font-bold">
              {summary.netAmount.toLocaleString("ar-SA")}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">إجمالي الفروقات</p>
            <p
              className={`text-2xl font-bold ${
                summary.totalVariance !== 0 ? "text-status-warning" : ""
              }`}
            >
              {summary.totalVariance.toLocaleString("ar-SA")}
            </p>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الوردية</TableHead>
                <TableHead>أمين الصندوق</TableHead>
                <TableHead>وقت الفتح</TableHead>
                <TableHead>وقت الإغلاق</TableHead>
                <TableHead className="text-left">التحصيل</TableHead>
                <TableHead className="text-left">الصرف</TableHead>
                <TableHead className="text-left">الفرق</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : shiftsReport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    لا توجد ورديات في هذه الفترة
                  </TableCell>
                </TableRow>
              ) : (
                shiftsReport.map((shift) => (
                  <TableRow key={shift.shift_id}>
                    <TableCell className="font-medium">
                      {shift.shift_number}
                    </TableCell>
                    <TableCell>{shift.cashier_name || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(shift.opened_at), "MM/dd HH:mm", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      {shift.closed_at
                        ? format(new Date(shift.closed_at), "MM/dd HH:mm", {
                            locale: ar,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-left text-status-success">
                      {(shift.total_collections || 0).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell className="text-left text-status-error">
                      {(shift.total_payments || 0).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell
                      className={`text-left ${
                        shift.variance !== 0 ? "text-status-warning font-bold" : ""
                      }`}
                    >
                      {(shift.variance || 0).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
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
