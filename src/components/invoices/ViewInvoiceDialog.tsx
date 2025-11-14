import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";

interface ViewInvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewInvoiceDialog = ({ invoiceId, open, onOpenChange }: ViewInvoiceDialogProps) => {
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
      return data;
    },
    enabled: !!invoiceId,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      issued: "default",
      paid: "default",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      draft: "مسودة",
      issued: "صادرة",
      paid: "مدفوعة",
      cancelled: "ملغاة",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (invoiceLoading || linesLoading) {
    return (
      <ResponsiveDialog 
        open={open} 
        onOpenChange={onOpenChange}
        title="تفاصيل الفاتورة"
        size="xl"
      >
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveDialog>
    );
  }

  if (!invoice) return null;

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="تفاصيل الفاتورة"
      size="xl"
      className="print:max-w-full print:max-h-full"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-start print:hidden">
          <div>
            <h2 className="text-2xl font-bold">فاتورة #{invoice.invoice_number}</h2>
            <p className="text-sm text-muted-foreground">
              التاريخ: {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(invoice.status)}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">بيانات العميل</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">الاسم:</span> {invoice.customer_name}</p>
              {invoice.customer_email && (
                <p><span className="font-medium">البريد:</span> {invoice.customer_email}</p>
              )}
              {invoice.customer_phone && (
                <p><span className="font-medium">الهاتف:</span> {invoice.customer_phone}</p>
              )}
              {invoice.customer_address && (
                <p><span className="font-medium">العنوان:</span> {invoice.customer_address}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">تفاصيل الفاتورة</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">رقم الفاتورة:</span> {invoice.invoice_number}</p>
              <p><span className="font-medium">تاريخ الإصدار:</span> {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}</p>
              {invoice.due_date && (
                <p><span className="font-medium">تاريخ الاستحقاق:</span> {format(new Date(invoice.due_date), "dd/MM/yyyy")}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">بنود الفاتورة</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المجموع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceLines?.map((line, index) => (
                <TableRow key={line.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell>{line.quantity}</TableCell>
                  <TableCell>{Number(line.unit_price).toFixed(2)} ر.س</TableCell>
                  <TableCell>{Number(line.line_total).toFixed(2)} ر.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span>{Number(invoice.subtotal).toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span>{Number(invoice.tax_amount).toFixed(2)} ر.س</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي:</span>
              <span>{Number(invoice.total_amount).toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div>
            <h3 className="font-semibold mb-2">ملاحظات</h3>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
};
