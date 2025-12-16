import { useQueryClient } from "@tanstack/react-query";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Loader2, Mail } from "lucide-react";
import EnhancedInvoiceView from "./EnhancedInvoiceView";
import { useOrganizationSettings } from "@/hooks/governance/useOrganizationSettings";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { toast } from "sonner";
import { useState } from "react";
import { logger } from "@/lib/logger";
import { InvoiceStatusActions } from "./InvoiceStatusActions";
import { format } from "@/lib/date";
import { useInvoiceDetails } from "@/hooks/invoices/useInvoiceDetails";
import { EdgeFunctionService } from "@/services/edge-function.service";

interface ViewInvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewInvoiceDialog = ({ invoiceId, open, onOpenChange }: ViewInvoiceDialogProps) => {
  const { settings: orgSettings } = useOrganizationSettings();
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  
  const { invoice, invoiceLines, invoiceLoading, linesLoading } = useInvoiceDetails(invoiceId);

  const handlePrint = () => {
    // الحصول على محتوى الفاتورة
    const invoiceContent = document.querySelector('#invoice-content');
    if (!invoiceContent) {
      toast.error("لم يتم العثور على محتوى الفاتورة");
      return;
    }

    // طباعة مباشرة
    window.print();
  };
  
  const handleDownloadPDF = async () => {
    if (invoice && invoiceLines) {
      setIsExporting(true);
      try {
        await generateInvoicePDF(invoice, invoiceLines as any, orgSettings);
        toast.success("تم تصدير الفاتورة بنجاح");
      } catch (error) {
        logger.error(error, { context: 'generate_invoice_pdf', severity: 'medium' });
        toast.error("حدث خطأ أثناء تصدير الفاتورة");
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!invoice.customer_email) {
      toast.error("لا يوجد بريد إلكتروني للعميل");
      return;
    }

    try {
      const result = await EdgeFunctionService.invoke("send-invoice-email", {
        invoiceId: invoice.id,
        customerEmail: invoice.customer_email,
        customerName: invoice.customer_name,
        invoiceNumber: invoice.invoice_number,
        totalAmount: invoice.total_amount
      });

      if (!result.success) throw new Error(result.error);
      toast.success("تم إرسال الفاتورة بنجاح");
    } catch (error) {
      logger.error(error, { context: 'send_invoice_email', severity: 'medium' });
      toast.error("فشل إرسال البريد");
    }
  };

  if (invoiceLoading || linesLoading) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="تفاصيل الفاتورة" size="xl">
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
      description={`رقم الفاتورة: ${invoice.invoice_number} | التاريخ: ${format(new Date(invoice.invoice_date), "yyyy-MM-dd")}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 ms-2" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 ms-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 ms-2" />
            )}
            {isExporting ? "جاري التصدير..." : "تصدير PDF"}
          </Button>
          {invoice.customer_email && (
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Mail className="h-4 w-4 ms-2" />
              إرسال بريد
            </Button>
          )}
        </div>
        <div id="invoice-content">
          <EnhancedInvoiceView invoice={invoice} lines={invoiceLines as any || []} orgSettings={orgSettings} />
        </div>
        <div className="border-t pt-4 mt-4 print:hidden">
          <InvoiceStatusActions 
            invoice={invoice} 
            onStatusChanged={() => {
              queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
              queryClient.invalidateQueries({ queryKey: ["invoices"] });
            }}
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
};
