import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

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

  const handleExportPDF = async () => {
    try {
      // Dynamic import for jsPDF
      const [{ default: jsPDF }, autoTable] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set Arabic font
      doc.addFont("https://cdn.jsdelivr.net/npm/amiri-font@1.0.0/Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
      doc.setR2L(true);

      // Title
      doc.setFontSize(20);
      doc.text("كشف حساب مستفيد", 105, 20, { align: "center" });

    // Beneficiary Info
    doc.setFontSize(12);
    doc.text(`اسم المستفيد: ${beneficiaryName}`, 20, 40);
    doc.text(`رقم المستفيد: ${beneficiaryId}`, 20, 50);
    doc.text(`إجمالي المدفوعات: ${totalAmount.toLocaleString()} ر.س`, 20, 60);
    doc.text(`عدد المدفوعات: ${payments.length}`, 20, 70);

    // Table
    const tableData = payments.map((payment) => [
      format(new Date(payment.date), "dd/MM/yyyy", { locale: ar }),
      payment.type,
      payment.description,
      `${payment.amount.toLocaleString()} ر.س`,
      payment.status,
    ]);

    doc.autoTable({
      startY: 80,
      head: [["التاريخ", "النوع", "الوصف", "المبلغ", "الحالة"]],
      body: tableData,
      styles: { font: "Amiri", halign: "right" },
      headStyles: { fillColor: [34, 139, 34] },
    });

    // Footer
    const finalY = doc.lastAutoTable?.finalY ?? 80;
    doc.setFontSize(10);
    doc.text(
      `تاريخ الإصدار: ${format(new Date(), "dd MMMM yyyy - HH:mm", { locale: ar })}`,
      20,
      finalY + 20
    );

      doc.save(`كشف-حساب-${beneficiaryName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      toast.error("فشل تصدير كشف الحساب");
      console.error("PDF export error:", error);
    }
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
              <FileText className="h-5 w-5 text-primary" />
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