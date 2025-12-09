/**
 * Hook لجلب وتوليد مستندات الدفعات (فواتير وسندات قبض)
 */
import { supabase } from "@/integrations/supabase/client";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import type { OrganizationSettings } from "@/hooks/useOrganizationSettings";

export function usePaymentDocuments() {
  const fetchInvoice = async (invoiceId: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)')
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const fetchReceipt = async (receiptId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('id, payment_number, payment_date, amount, description, payment_method, beneficiary_id, reference_number, payer_name')
      .eq('id', receiptId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const fetchOrganizationSettings = async () => {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
      .maybeSingle();

    if (error) throw error;
    return data as OrganizationSettings | null;
  };

  const findArchivedDocument = async (documentName: string) => {
    const { data } = await supabase
      .from('documents')
      .select('id, name, file_path')
      .eq('name', documentName)
      .maybeSingle();

    return data;
  };

  const getStoragePublicUrl = (path: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path);
    return publicUrl;
  };

  const viewInvoice = async (invoiceId: string) => {
    const invoiceData = await fetchInvoice(invoiceId);
    if (!invoiceData) return null;

    const documentName = `Invoice-${invoiceData.invoice_number}.pdf`;
    const archivedDoc = await findArchivedDocument(documentName);

    if (archivedDoc) {
      const date = new Date(invoiceData.invoice_date);
      const path = `invoices/${date.getFullYear()}/${date.getMonth() + 1}/${documentName}`;
      const publicUrl = getStoragePublicUrl(path);
      window.open(publicUrl, '_blank');
      return { type: 'archived', url: publicUrl };
    }

    const orgSettings = await fetchOrganizationSettings();
    if (orgSettings) {
      await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings);
      return { type: 'generated' };
    }

    return null;
  };

  const viewReceipt = async (receiptId: string) => {
    const receiptData = await fetchReceipt(receiptId);
    if (!receiptData) return null;

    const documentName = `Receipt-${receiptData.payment_number}.pdf`;
    const archivedDoc = await findArchivedDocument(documentName);

    if (archivedDoc) {
      const date = new Date(receiptData.payment_date);
      const path = `receipts/${date.getFullYear()}/${date.getMonth() + 1}/${documentName}`;
      const publicUrl = getStoragePublicUrl(path);
      window.open(publicUrl, '_blank');
      return { type: 'archived', url: publicUrl };
    }

    const orgSettings = await fetchOrganizationSettings();
    if (orgSettings) {
      await generateReceiptPDF(receiptData, orgSettings);
      return { type: 'generated' };
    }

    return null;
  };

  return {
    fetchInvoice,
    fetchReceipt,
    fetchOrganizationSettings,
    findArchivedDocument,
    getStoragePublicUrl,
    viewInvoice,
    viewReceipt,
  };
}
