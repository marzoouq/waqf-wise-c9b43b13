import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Printer, FileText, CheckCircle, XCircle, Send, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { COMPANY_INFO } from "@/lib/constants";
import { ZATCAQRCode } from "./ZATCAQRCode";
import { formatZATCADate, formatZATCACurrency } from "@/lib/zatca";

interface ViewInvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewInvoiceDialog = ({
  invoiceId,
  open,
  onOpenChange,
}: ViewInvoiceDialogProps) => {
  const queryClient = useQueryClient();

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

  const { data: invoiceLines, isLoading: linesLoading } = useQuery({
    queryKey: ["invoice-lines", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("invoice_lines")
        .select("*, accounts(code, name_ar)")
        .eq("invoice_id", invoiceId)
        .order("line_number");
      if (error) throw error;
      console.log("📋 Invoice Lines loaded:", data?.length || 0, "lines");
      return data;
    },
    enabled: !!invoiceId,
  });

  const { data: journalEntry } = useQuery({
    queryKey: ["invoice-journal-entry", invoice?.journal_entry_id],
    queryFn: async () => {
      if (!invoice?.journal_entry_id) return null;
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", invoice.journal_entry_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!invoice?.journal_entry_id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!invoiceId) return;
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة الفاتورة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      toast.error(`خطأ في تحديث الحالة: ${error.message}`);
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoice) {
      console.error("❌ No invoice data");
      return;
    }
    
    // Check if invoice lines are loaded
    if (!invoiceLines || invoiceLines.length === 0) {
      console.error("❌ No invoice lines:", invoiceLines);
      toast.error("لا يمكن تحميل الفاتورة: لا توجد بنود في الفاتورة");
      return;
    }

    console.log("✅ Generating PDF with", invoiceLines.length, "lines");

    const doc = new jsPDF();
    
    // Add Arabic font support
    doc.setLanguage("ar");
    
    // Header - Company Info (required by ZATCA)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_INFO.NAME_AR, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY_INFO.DESCRIPTION_AR, 105, 28, { align: "center" });
    doc.text(`الرقم الضريبي: ${COMPANY_INFO.TAX_NUMBER}`, 105, 34, { align: "center" });
    doc.text(`السجل التجاري: ${COMPANY_INFO.COMMERCIAL_REGISTRATION}`, 105, 40, { align: "center" });
    doc.text(COMPANY_INFO.ADDRESS_AR, 105, 46, { align: "center" });
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("فـاتـورة ضـريـبـيـة مـبـسـطـة", 105, 58, { align: "center" });
    doc.text("SIMPLIFIED TAX INVOICE", 105, 66, { align: "center" });
    
    // Invoice Details Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceDetailsY = 76;
    
    doc.text(`رقم الفاتورة: ${invoice.invoice_number}`, 15, invoiceDetailsY);
    doc.text(`Invoice No: ${invoice.invoice_number}`, 15, invoiceDetailsY + 6);
    
    doc.text(`التاريخ: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, 120, invoiceDetailsY);
    doc.text(`Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, 120, invoiceDetailsY + 6);
    
    if (invoice.due_date) {
      doc.text(`تاريخ الاستحقاق: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 15, invoiceDetailsY + 12);
      doc.text(`Due Date: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 15, invoiceDetailsY + 18);
    }
    
    // Customer Info Box (required by ZATCA)
    const customerY = invoiceDetailsY + 30;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, customerY - 5, 180, 25, "F");
    
    doc.setFont("helvetica", "bold");
    doc.text("بيانات العميل / Customer Information", 20, customerY);
    
    doc.setFont("helvetica", "normal");
    doc.text(`الاسم / Name: ${invoice.customer_name}`, 20, customerY + 8);
    
    if (invoice.customer_phone) {
      doc.text(`الهاتف / Phone: ${invoice.customer_phone}`, 20, customerY + 14);
    }
    
    if (invoice.customer_email) {
      doc.text(`البريد / Email: ${invoice.customer_email}`, 120, customerY + 14);
    }
    
    // Table
    const tableY = customerY + 32;
    const tableData = invoiceLines?.map((line, index) => [
      (index + 1).toString(),
      line.description,
      Number(line.quantity).toString(),
      Number(line.unit_price).toFixed(2),
      Number(line.line_total).toFixed(2),
    ]) || [];
    
    (doc as any).autoTable({
      startY: tableY,
      head: [["#", "الوصف / Description", "الكمية / Qty", "السعر / Price", "المجموع / Total"]],
      body: tableData,
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [34, 88, 64],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
    });
    
    // Totals (required by ZATCA with specific format)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = 135;
    
    doc.setFillColor(250, 250, 250);
    doc.rect(120, finalY - 5, 75, 35, "F");
    
    doc.setFont("helvetica", "normal");
    doc.text("المجموع الفرعي / Subtotal:", totalsX, finalY);
    doc.text(`${Number(invoice.subtotal).toFixed(2)} ر.س`, 188, finalY, { align: "right" });
    
    doc.text("ضريبة القيمة المضافة (15%) / VAT:", totalsX, finalY + 8);
    doc.text(`${Number(invoice.tax_amount).toFixed(2)} ر.س`, 188, finalY + 8, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("الإجمالي / Total:", totalsX, finalY + 18);
    doc.text(`${Number(invoice.total_amount).toFixed(2)} ر.س`, 188, finalY + 18, { align: "right" });
    
    // QR Code placeholder (ZATCA requirement)
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("رمز الاستجابة السريعة للزكاة والضريبة والجمارك", 15, finalY + 25);
    doc.text("ZATCA QR Code", 15, finalY + 30);
    doc.rect(15, finalY + 5, 30, 30);
    
    // Footer - Copyright & Contact
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(COMPANY_INFO.COPYRIGHT_AR, 105, pageHeight - 20, { align: "center" });
    doc.text(COMPANY_INFO.COPYRIGHT_EN, 105, pageHeight - 15, { align: "center" });
    doc.text(`${COMPANY_INFO.PHONE} | ${COMPANY_INFO.EMAIL} | ${COMPANY_INFO.WEBSITE}`, 105, pageHeight - 10, { align: "center" });
    
    // Save
    doc.save(`فاتورة-${invoice.invoice_number}.pdf`);
    toast.success("تم تحميل الفاتورة بصيغة PDF");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      draft: { label: "مسودة", variant: "secondary" },
      sent: { label: "مرسلة", variant: "default" },
      paid: { label: "مدفوعة", variant: "default" },
      cancelled: { label: "ملغاة", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (invoiceLoading || linesLoading || !invoice) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>تفاصيل الفاتورة</span>
            {getStatusBadge(invoice.status)}
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-print-content" className="space-y-6">
          {/* Header - Company Info */}
          <div className="text-center print:block hidden border-b-2 border-primary pb-6 mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">{COMPANY_INFO.NAME_AR}</h1>
            <p className="text-sm text-muted-foreground">{COMPANY_INFO.DESCRIPTION_AR}</p>
            <p className="text-sm font-mono mt-1">الرقم الضريبي: {COMPANY_INFO.TAX_NUMBER}</p>
            <p className="text-sm font-mono">السجل التجاري: {COMPANY_INFO.COMMERCIAL_REGISTRATION}</p>
            <p className="text-sm mt-1">{COMPANY_INFO.ADDRESS_AR}</p>
            <p className="text-xs text-muted-foreground">{COMPANY_INFO.PHONE} | {COMPANY_INFO.EMAIL}</p>
            <h2 className="text-2xl font-bold mt-4 mb-1">فـاتـورة ضـريـبـيـة مـبـسـطـة</h2>
            <p className="text-sm text-muted-foreground">SIMPLIFIED TAX INVOICE</p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg print:bg-white print:border-2 print:border-primary">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">رقم الفاتورة</div>
              <div className="font-mono font-bold text-xl text-primary">{invoice.invoice_number}</div>
              <div className="text-xs text-muted-foreground">Invoice Number</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">التاريخ</div>
              <div className="font-semibold text-lg">
                {format(new Date(invoice.invoice_date), "dd MMMM yyyy", { locale: ar })}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
              </div>
            </div>
            {invoice.due_date && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">تاريخ الاستحقاق</div>
                <div className="font-semibold text-lg">
                  {format(new Date(invoice.due_date), "dd MMMM yyyy", { locale: ar })}
                </div>
                <div className="text-xs text-muted-foreground">Due Date</div>
              </div>
            )}
            <div className="print:hidden space-y-1">
              <div className="text-sm font-medium text-muted-foreground">الحالة</div>
              <div>{getStatusBadge(invoice.status)}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 p-6 border-2 rounded-lg bg-muted/20 print:border-2 print:border-primary print:bg-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-primary">بيانات العميل</h3>
              <span className="text-sm text-muted-foreground">/ Customer Information</span>
            </div>
            <Separator className="bg-primary/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block">الاسم / Name</span>
                <span className="font-semibold text-base">{invoice.customer_name}</span>
              </div>
              {invoice.customer_email && (
                <div className="space-y-1">
                  <span className="text-muted-foreground block">البريد / Email</span>
                  <span className="font-mono">{invoice.customer_email}</span>
                </div>
              )}
              {invoice.customer_phone && (
                <div className="space-y-1">
                  <span className="text-muted-foreground block">الهاتف / Phone</span>
                  <span className="font-mono">{invoice.customer_phone}</span>
                </div>
              )}
              {invoice.customer_address && (
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground block">العنوان / Address</span>
                  <span>{invoice.customer_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="border-2 rounded-lg overflow-hidden print:border-2 print:border-primary shadow-soft">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10 print:bg-primary/20 print:border-2 print:border-primary">
                  <TableHead className="font-bold print:border-2 print:border-primary text-center">#</TableHead>
                  <TableHead className="font-bold print:border-2 print:border-primary">الوصف / Description</TableHead>
                  <TableHead className="font-bold text-center print:border-2 print:border-primary">الكمية<br/><span className="text-xs font-normal">Qty</span></TableHead>
                  <TableHead className="font-bold text-center print:border-2 print:border-primary">السعر<br/><span className="text-xs font-normal">Price</span></TableHead>
                  <TableHead className="font-bold text-center print:border-2 print:border-primary">الإجمالي<br/><span className="text-xs font-normal">Total</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceLines?.map((line, index) => (
                  <TableRow key={line.id} className="print:border-2 print:border-primary hover:bg-muted/50">
                    <TableCell className="print:border-2 print:border-primary text-center font-semibold">
                      {line.line_number}
                    </TableCell>
                    <TableCell className="print:border-2 print:border-primary">
                      <div className="space-y-1">
                        <div className="font-medium">{line.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {line.accounts?.code} - {line.accounts?.name_ar}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center print:border-2 print:border-primary font-mono">
                      {Number(line.quantity)}
                    </TableCell>
                    <TableCell className="text-center font-mono print:border-2 print:border-primary">
                      {Number(line.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold print:border-2 print:border-primary text-primary">
                      {Number(line.line_total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals - ZATCA Compliant */}
          <div className="flex justify-end">
            <div className="w-full md:w-96 space-y-3 p-6 bg-muted/30 rounded-lg print:bg-gray-50 print:border-2 print:border-primary shadow-medium">
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">المجموع الفرعي / Subtotal</span>
                <span className="font-mono font-semibold text-base">{Number(invoice.subtotal).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">ضريبة القيمة المضافة (15%) / VAT</span>
                <span className="font-mono font-semibold text-base">{Number(invoice.tax_amount).toFixed(2)} ر.س</span>
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex justify-between items-center bg-primary/10 -mx-6 -mb-6 px-6 py-4 rounded-b-lg print:bg-primary/20">
                <div className="space-y-1">
                  <div className="font-bold text-lg text-primary">الإجمالي</div>
                  <div className="text-xs text-muted-foreground">Total Amount</div>
                </div>
                <div className="text-left">
                  <div className="font-mono font-bold text-2xl text-primary">{Number(invoice.total_amount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">ريال سعودي / SAR</div>
                </div>
              </div>
            </div>
          </div>

          {/* ZATCA QR Code */}
          <div className="print:hidden">
            <ZATCAQRCode
              data={{
                sellerName: COMPANY_INFO.NAME_AR,
                sellerVatNumber: COMPANY_INFO.TAX_NUMBER,
                invoiceDate: formatZATCADate(new Date(invoice.invoice_date)),
                invoiceTotal: formatZATCACurrency(Number(invoice.total_amount)),
                vatTotal: formatZATCACurrency(Number(invoice.tax_amount)),
              }}
              size={200}
            />
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-6 border-2 rounded-lg bg-accent/5 print:border-2 print:border-primary">
              <h3 className="font-semibold mb-3 text-primary">ملاحظات / Notes</h3>
              <p className="text-sm leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Footer - Copyright & Contact */}
          <div className="print:block hidden text-center mt-8 pt-4 border-t-2 border-primary/20 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">{COMPANY_INFO.COPYRIGHT_AR}</p>
            <p>{COMPANY_INFO.COPYRIGHT_EN}</p>
            <p>{COMPANY_INFO.PHONE} | {COMPANY_INFO.EMAIL} | {COMPANY_INFO.WEBSITE}</p>
            <p className="text-xs">{COMPANY_INFO.ADDRESS_AR}</p>
          </div>

          {/* Journal Entry Link */}
          {journalEntry && (
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30 print:hidden">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">القيد المحاسبي المرتبط</h3>
              </div>
              <div className="text-sm">
                <div>رقم القيد: <span className="font-mono font-semibold">{journalEntry.entry_number}</span></div>
                <div>التاريخ: {format(new Date(journalEntry.entry_date), "dd/MM/yyyy")}</div>
                <div>الحالة: <Badge variant={journalEntry.status === "posted" ? "default" : "secondary"}>
                  {journalEntry.status === "posted" ? "مرحّل" : "مسودة"}
                </Badge></div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-6 border-t print:hidden">
          <Button onClick={handlePrint} variant="outline" size="default" className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          
          <Button onClick={handleDownloadPDF} variant="outline" size="default" className="gap-2">
            <Download className="h-4 w-4" />
            تحميل PDF
          </Button>

          {invoice.status === "draft" && (
            <Button
              onClick={() => updateStatusMutation.mutate("sent")}
              disabled={updateStatusMutation.isPending}
              size="default"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              إرسال
            </Button>
          )}

          {(invoice.status === "draft" || invoice.status === "sent") && (
            <Button
              onClick={() => updateStatusMutation.mutate("paid")}
              disabled={updateStatusMutation.isPending}
              variant="default"
              size="default"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              تحديد كمدفوعة
            </Button>
          )}

          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <Button
              onClick={() => updateStatusMutation.mutate("cancelled")}
              disabled={updateStatusMutation.isPending}
              variant="destructive"
              size="default"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              إلغاء الفاتورة
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
