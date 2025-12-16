import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Send, CheckCircle, ScanLine } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatchInvoiceOCR } from "@/components/invoices/BatchInvoiceOCR";
import { useInvoiceManagement } from "@/hooks/accounting/useInvoiceManagement";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export function InvoiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  
  const { invoices, isLoading, error, refetch, updateStatus } = useInvoiceManagement(selectedStatus);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { label: "مسودة", variant: "secondary" as const, className: "" },
      sent: { label: "مرسلة", variant: "default" as const, className: "" },
      paid: { label: "مدفوعة", variant: "default" as const, className: "bg-success/10 text-success" },
      overdue: { label: "متأخرة", variant: "destructive" as const, className: "" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الفواتير..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الفواتير" message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الفواتير</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowOCRDialog(true)}>
            <ScanLine className="ms-2 h-4 w-4" />
            استيراد من صورة
          </Button>
          <Button>
            <Plus className="ms-2 h-4 w-4" />
            فاتورة جديدة
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "draft", "sent", "paid", "overdue"].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status)}
          >
            {status === "all" ? "الكل" : 
             status === "draft" ? "مسودة" :
             status === "sent" ? "مرسلة" :
             status === "paid" ? "مدفوعة" : "متأخرة"}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {invoices?.map((invoice) => (
          <Card key={invoice.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">العميل</p>
                    <p className="font-medium">{invoice.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">تاريخ الفاتورة</p>
                    <p className="font-medium">
                      {new Date(invoice.invoice_date).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <p className="text-muted-foreground">تاريخ الاستحقاق</p>
                      <p className="font-medium">
                        {new Date(invoice.due_date).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">الإجمالي الفرعي: </span>
                    <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الضريبة: </span>
                    <span className="font-semibold">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الإجمالي: </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {invoice.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(invoice.id, "sent")}
                  >
                    <Send className="ms-2 h-4 w-4" />
                    إرسال
                  </Button>
                )}
                {invoice.status === "sent" && (
                  <Button
                    size="sm"
                    className="bg-success hover:bg-success/90"
                    onClick={() => updateStatus(invoice.id, "paid")}
                  >
                    <CheckCircle className="ms-2 h-4 w-4" />
                    تأكيد الدفع
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showOCRDialog} onOpenChange={setShowOCRDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              استيراد فواتير من الصور
            </DialogTitle>
            <DialogDescription>
              ارفع صورة أو عدة صور للفواتير لاستخراج البيانات تلقائياً باستخدام الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>
          <BatchInvoiceOCR
            onComplete={(results) => {
              queryClient.invalidateQueries({ queryKey: ["invoices"] });
              setShowOCRDialog(false);
              toast({
                title: "تم الاستيراد بنجاح",
                description: `تم استيراد ${results.length} فاتورة`,
              });
            }}
            onCancel={() => setShowOCRDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
