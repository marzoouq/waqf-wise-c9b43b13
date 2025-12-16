/**
 * Hook لعرض مستندات الدفع (الفواتير وسندات القبض)
 * @version 2.8.67
 */

import { InvoiceService, PaymentService, SettingsService, StorageService } from "@/services";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { useToast } from "@/hooks/ui/use-toast";
import type { RentalPayment } from "@/hooks/useRentalPayments";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";

export function usePaymentDocuments() {
  const { toast } = useToast();

  const viewInvoice = async (payment: RentalPayment) => {
    if (!payment.invoice_id) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار فاتورة لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    try {
      const invoiceData = await InvoiceService.getWithLines(payment.invoice_id);

      if (!invoiceData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفاتورة",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const documentExists = await StorageService.documentExists(
        `Invoice-${invoiceData.invoice_number}.pdf`
      );

      if (documentExists) {
        const publicUrl = StorageService.getPublicUrl(
          'documents',
          `invoices/${new Date(invoiceData.invoice_date).getFullYear()}/${new Date(invoiceData.invoice_date).getMonth() + 1}/Invoice-${invoiceData.invoice_number}.pdf`
        );
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const orgSettings = await SettingsService.getOrganizationSettings();

        if (orgSettings) {
          await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings as OrganizationSettings | null);
          
          toast({
            title: "تم التوليد",
            description: "تم توليد الفاتورة وتحميلها",
          });
        }
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض الفاتورة",
        variant: "destructive"
      });
    }
  };

  const viewReceipt = async (payment: RentalPayment) => {
    if (!payment.receipt_id) {
      toast({
        title: "تنبيه",
        description: "لم يتم إصدار سند قبض لهذه الدفعة بعد",
        variant: "destructive"
      });
      return;
    }

    try {
      const receiptData = await PaymentService.getById(payment.receipt_id);

      if (!receiptData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات سند القبض",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const documentExists = await StorageService.documentExists(
        `Receipt-${receiptData.payment_number}.pdf`
      );

      if (documentExists) {
        const publicUrl = StorageService.getPublicUrl(
          'documents',
          `receipts/${new Date(receiptData.payment_date).getFullYear()}/${new Date(receiptData.payment_date).getMonth() + 1}/Receipt-${receiptData.payment_number}.pdf`
        );
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const orgSettings = await SettingsService.getOrganizationSettings();

        if (orgSettings) {
          await generateReceiptPDF(receiptData, orgSettings as OrganizationSettings | null);
          
          toast({
            title: "تم التوليد",
            description: "تم توليد سند القبض وتحميله",
          });
        }
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء عرض سند القبض",
        variant: "destructive"
      });
    }
  };

  return {
    viewInvoice,
    viewReceipt,
  };
}
