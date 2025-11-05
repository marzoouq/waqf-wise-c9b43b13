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
import { Printer, FileText, CheckCircle, XCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

  const { data: invoice, isLoading } = useQuery({
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

  const { data: invoiceLines } = useQuery({
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

  if (isLoading || !invoice) {
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
          {/* Header */}
          <div className="text-center print:block hidden">
            <h1 className="text-3xl font-bold mb-2">فاتورة</h1>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg print:bg-white print:border">
            <div>
              <div className="text-sm text-muted-foreground">رقم الفاتورة</div>
              <div className="font-mono font-bold text-lg">{invoice.invoice_number}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">التاريخ</div>
              <div className="font-semibold">
                {format(new Date(invoice.invoice_date), "dd MMMM yyyy", { locale: ar })}
              </div>
            </div>
            {invoice.due_date && (
              <div>
                <div className="text-sm text-muted-foreground">تاريخ الاستحقاق</div>
                <div className="font-semibold">
                  {format(new Date(invoice.due_date), "dd MMMM yyyy", { locale: ar })}
                </div>
              </div>
            )}
            <div className="print:hidden">
              <div className="text-sm text-muted-foreground">الحالة</div>
              <div>{getStatusBadge(invoice.status)}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 p-4 border rounded-lg print:border-black">
            <h3 className="font-bold text-lg">بيانات العميل</h3>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">الاسم: </span>
                <span className="font-semibold">{invoice.customer_name}</span>
              </div>
              {invoice.customer_email && (
                <div>
                  <span className="text-muted-foreground">البريد: </span>
                  <span>{invoice.customer_email}</span>
                </div>
              )}
              {invoice.customer_phone && (
                <div>
                  <span className="text-muted-foreground">الهاتف: </span>
                  <span>{invoice.customer_phone}</span>
                </div>
              )}
              {invoice.customer_address && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">العنوان: </span>
                  <span>{invoice.customer_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="border rounded-lg overflow-hidden print:border-black">
            <Table>
              <TableHeader>
                <TableRow className="print:border-black">
                  <TableHead className="print:border print:border-black">#</TableHead>
                  <TableHead className="print:border print:border-black">الحساب</TableHead>
                  <TableHead className="print:border print:border-black">الوصف</TableHead>
                  <TableHead className="text-center print:border print:border-black">الكمية</TableHead>
                  <TableHead className="text-left print:border print:border-black">السعر</TableHead>
                  <TableHead className="text-left print:border print:border-black">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceLines?.map((line) => (
                  <TableRow key={line.id} className="print:border-black">
                    <TableCell className="print:border print:border-black">{line.line_number}</TableCell>
                    <TableCell className="print:border print:border-black">
                      {line.accounts?.code} - {line.accounts?.name_ar}
                    </TableCell>
                    <TableCell className="print:border print:border-black">{line.description}</TableCell>
                    <TableCell className="text-center print:border print:border-black">
                      {Number(line.quantity)}
                    </TableCell>
                    <TableCell className="text-left font-mono print:border print:border-black">
                      {Number(line.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-left font-mono font-semibold print:border print:border-black">
                      {Number(line.line_total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2 p-4 bg-muted/30 rounded-lg print:bg-white print:border print:border-black">
              <div className="flex justify-between text-sm">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{Number(invoice.subtotal).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono">{Number(invoice.tax_amount).toFixed(2)} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span className="font-mono">{Number(invoice.total_amount).toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 border rounded-lg print:border-black">
              <h3 className="font-semibold mb-2">ملاحظات:</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

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
        <div className="flex flex-wrap gap-2 pt-4 border-t print:hidden">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>

          {invoice.status === "draft" && (
            <Button
              onClick={() => updateStatusMutation.mutate("sent")}
              disabled={updateStatusMutation.isPending}
            >
              <Send className="h-4 w-4 ml-2" />
              إرسال
            </Button>
          )}

          {(invoice.status === "draft" || invoice.status === "sent") && (
            <Button
              onClick={() => updateStatusMutation.mutate("paid")}
              disabled={updateStatusMutation.isPending}
              variant="default"
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              تحديد كمدفوعة
            </Button>
          )}

          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <Button
              onClick={() => updateStatusMutation.mutate("cancelled")}
              disabled={updateStatusMutation.isPending}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 ml-2" />
              إلغاء الفاتورة
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
