/**
 * useDocumentViewer Hook
 * عرض الفواتير وسندات القبض
 * @version 2.9.43
 */

import { useState } from "react";
import { DocumentService } from "@/services/document.service";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { useToast } from "@/hooks/ui/use-toast";
import type { InvoiceLine } from "@/types/invoice-line";

// تحويل بيانات الفاتورة من الخدمة إلى صيغة PDF
function toInvoicePDFFormat(invoice: Awaited<ReturnType<typeof DocumentService.getInvoiceWithLines>>['invoice']) {
  return {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    customer_name: invoice.customer_name || '',
    customer_vat_number: invoice.customer_vat_number || undefined,
    customer_phone: invoice.customer_phone || undefined,
    customer_email: invoice.customer_email || undefined,
    subtotal: invoice.net_amount || 0,
    tax_amount: invoice.tax_amount || 0,
    total_amount: invoice.total_amount || 0,
    qr_code_data: invoice.qr_code_data || undefined,
  };
}

// تحويل بنود الفاتورة لصيغة PDF
function toInvoiceLinesPDFFormat(lines: InvoiceLine[]) {
  return lines.map(line => ({
    line_number: line.line_number,
    description: line.description,
    quantity: line.quantity,
    unit_price: line.unit_price,
    subtotal: line.subtotal,
    tax_rate: line.tax_rate,
    tax_amount: line.tax_amount,
    line_total: line.line_total,
  }));
}

// تحويل بيانات سند القبض لصيغة PDF
function toReceiptPDFFormat(receipt: Awaited<ReturnType<typeof DocumentService.getReceipt>>) {
  if (!receipt) return null;
  return {
    id: receipt.id,
    payment_number: receipt.payment_number || '',
    payment_date: receipt.payment_date,
    amount: receipt.amount,
    payer_name: receipt.payer_name || '',
    payment_method: receipt.payment_method || undefined,
    description: receipt.description || '',
    reference_number: receipt.reference_number || undefined,
  };
}

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
        const pdfInvoice = toInvoicePDFFormat(invoice);
        const pdfLines = toInvoiceLinesPDFFormat(lines);
        await generateInvoicePDF(pdfInvoice, pdfLines, null);
        
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
        const pdfReceipt = toReceiptPDFFormat(receiptData);
        if (pdfReceipt) {
          await generateReceiptPDF(pdfReceipt, null);
        }
        
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
