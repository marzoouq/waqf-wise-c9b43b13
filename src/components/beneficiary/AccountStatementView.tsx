import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PaymentRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  status: string;
}

interface AccountStatementViewProps {
  beneficiaryName: string;
  beneficiaryId: string;
  payments: PaymentRecord[];
}

export function AccountStatementView({
  beneficiaryName,
  beneficiaryId,
  payments,
}: AccountStatementViewProps) {
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleExportPDF = () => {
    // TODO: Implement PDF export using jsPDF
    console.log("Exporting account statement as PDF");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              كشف حساب
            </CardTitle>
            <CardDescription>سجل المدفوعات والمستحقات</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <FileText className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 ml-2" />
              تحميل PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* معلومات المستفيد */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">اسم المستفيد</p>
            <p className="font-semibold">{beneficiaryName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">رقم المستفيد</p>
            <p className="font-semibold">{beneficiaryId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
            <p className="font-semibold text-primary">{totalAmount.toLocaleString()} ر.س</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">عدد المدفوعات</p>
            <p className="font-semibold">{payments.length}</p>
          </div>
        </div>

        {/* جدول المدفوعات */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">سجل المدفوعات</h3>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد مدفوعات مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.date), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.description}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {payment.amount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "مكتمل"
                              ? "default"
                              : payment.status === "معلق"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ملاحظة قانونية */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p>
            * هذا الكشف صادر عن منصة إدارة الوقف الإلكترونية ويعتبر وثيقة رسمية
            لسجل المدفوعات والمستحقات.
          </p>
          <p className="mt-1">
            تاريخ الإصدار: {format(new Date(), "dd MMMM yyyy - HH:mm", { locale: ar })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}