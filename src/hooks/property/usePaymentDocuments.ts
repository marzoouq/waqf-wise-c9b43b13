/**
 * Hook لعرض مستندات الدفع (الفواتير وسندات القبض)
 */

import { supabase } from "@/integrations/supabase/client";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { useToast } from "@/hooks/use-toast";
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
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, invoice_lines(*)')
        .eq('id', payment.invoice_id)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفاتورة",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const { data: documentData } = await supabase
        .from('documents')
        .select('id, name, file_path')
        .eq('name', `Invoice-${invoiceData.invoice_number}.pdf`)
        .maybeSingle();

      if (documentData) {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`invoices/${new Date(invoiceData.invoice_date).getFullYear()}/${new Date(invoiceData.invoice_date).getMonth() + 1}/Invoice-${invoiceData.invoice_number}.pdf`);
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const { data: orgSettings } = await supabase
          .from('organization_settings')
          .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
          .maybeSingle();

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
      const { data: receiptData, error: receiptError } = await supabase
        .from('payments')
        .select('id, payment_number, payment_date, amount, description, payment_method, beneficiary_id, reference_number, payer_name')
        .eq('id', payment.receipt_id)
        .maybeSingle();

      if (receiptError || !receiptData) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات سند القبض",
          variant: "destructive"
        });
        return;
      }

      // البحث عن المستند المؤرشف
      const { data: documentData } = await supabase
        .from('documents')
        .select('id, name, file_path')
        .eq('name', `Receipt-${receiptData.payment_number}.pdf`)
        .maybeSingle();

      if (documentData) {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`receipts/${new Date(receiptData.payment_date).getFullYear()}/${new Date(receiptData.payment_date).getMonth() + 1}/Receipt-${receiptData.payment_number}.pdf`);
        
        window.open(publicUrl, '_blank');
      } else {
        // fallback: توليد PDF فوري
        const { data: orgSettings } = await supabase
          .from('organization_settings')
          .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
          .maybeSingle();

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
