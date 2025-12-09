/**
 * useDocumentViewer Hook
 * عرض الفواتير وسندات القبض
 */

import { useState } from "react";
import { DocumentService } from "@/services/document.service";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { useToast } from "@/hooks/use-toast";

export function useDocumentViewer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const viewInvoice = async (invoiceId: string) => {
    if (!invoiceId) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار فاتورة لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await DocumentService.getInvoiceWithLines(invoiceId);

      if (!result) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفاتورة",
          variant: "destructive"
        });
        return;
      }

      const { invoice, lines } = result;

      // البحث عن المستند المؤرشف
      const documentName = `Invoice-${invoice.invoice_number}.pdf`;
      const archivedDoc = await DocumentService.findArchivedDocument(documentName);

      if (archivedDoc) {
        const invoiceDate = new Date(invoice.invoice_date);
        const path = `invoices/${invoiceDate.getFullYear()}/${invoiceDate.getMonth() + 1}/${documentName}`;
        const publicUrl = DocumentService.getPublicUrl('documents', path);
        window.open(publicUrl, '_blank');
      } else {
        // توليد PDF فوري
        const orgSettings = await DocumentService.getOrganizationSettings();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await generateInvoicePDF(invoice as any, lines as any, orgSettings as any);
        
        toast({
          title: "تم التوليد",
          description: "تم توليد الفاتورة وتحميلها",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض الفاتورة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewReceipt = async (receiptId: string) => {
    if (!receiptId) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار سند قبض لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const receiptData = await DocumentService.getReceipt(receiptId);

      if (!receiptData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات سند القبض",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const documentName = `Receipt-${receiptData.payment_number}.pdf`;
      const archivedDoc = await DocumentService.findArchivedDocument(documentName);

      if (archivedDoc) {
        const receiptDate = new Date(receiptData.payment_date);
        const path = `receipts/${receiptDate.getFullYear()}/${receiptDate.getMonth() + 1}/${documentName}`;
        const publicUrl = DocumentService.getPublicUrl('documents', path);
        window.open(publicUrl, '_blank');
      } else {
        // توليد PDF فوري
        const orgSettings = await DocumentService.getOrganizationSettings();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await generateReceiptPDF(receiptData as any, orgSettings as any);
        
        toast({
          title: "تم التوليد",
          description: "تم توليد سند القبض وتحميله",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض سند القبض",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    viewInvoice,
    viewReceipt,
    isLoading,
  };
}
