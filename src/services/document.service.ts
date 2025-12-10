/**
 * Document Service - خدمة المستندات والفواتير
 * @version 2.8.47
 */

import { supabase } from "@/integrations/supabase/client";

export interface InvoiceData {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  customer_vat_number: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  status: string | null;
  payment_status: string | null;
  qr_code_data: string | null;
}

export interface InvoiceLine {
  id: string;
  line_number: number;
  description: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number | null;
  tax_amount: number | null;
  line_total: number;
}

export interface ReceiptData {
  id: string;
  payment_number: string | null;
  payment_date: string;
  amount: number;
  description: string | null;
  payment_method: string | null;
  beneficiary_id: string | null;
  reference_number: string | null;
  payer_name: string | null;
}

export interface OrganizationSettings {
  id: string;
  organization_name_ar: string | null;
  organization_name_en: string | null;
  address_ar: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  vat_registration_number: string | null;
  commercial_registration_number: string | null;
}

// Type for invoice with lines query result
interface InvoiceWithLinesRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  customer_vat_number: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  subtotal: number | null;
  status: string | null;
  payment_status: string | null;
  qr_code_data: string | null;
  invoice_lines: InvoiceLine[];
}

export const DocumentService = {
  /**
   * جلب بيانات الفاتورة مع البنود
   */
  async getInvoiceWithLines(invoiceId: string): Promise<{ invoice: InvoiceData; lines: InvoiceLine[] } | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)')
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const invoiceData = data as unknown as InvoiceWithLinesRow;

    return {
      invoice: {
        id: invoiceData.id,
        invoice_number: invoiceData.invoice_number,
        invoice_date: invoiceData.invoice_date,
        customer_name: invoiceData.customer_name,
        customer_vat_number: invoiceData.customer_vat_number,
        customer_phone: invoiceData.customer_phone,
        customer_email: invoiceData.customer_email,
        total_amount: invoiceData.total_amount,
        tax_amount: invoiceData.tax_amount,
        net_amount: invoiceData.net_amount ?? invoiceData.subtotal,
        status: invoiceData.status,
        payment_status: invoiceData.payment_status ?? 'pending',
        qr_code_data: invoiceData.qr_code_data,
      },
      lines: (invoiceData.invoice_lines || []) as InvoiceLine[],
    };
  },

  /**
   * جلب سند القبض
   */
  async getReceipt(receiptId: string): Promise<ReceiptData | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('id, payment_number, payment_date, amount, description, payment_method, beneficiary_id, reference_number, payer_name')
      .eq('id', receiptId)
      .maybeSingle();

    if (error) throw error;
    return data as ReceiptData | null;
  },

  /**
   * البحث عن مستند مؤرشف
   */
  async findArchivedDocument(documentName: string): Promise<{ id: string; name: string; file_path: string } | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, file_path')
      .eq('name', documentName)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * جلب إعدادات المنظمة
   */
  async getOrganizationSettings(): Promise<OrganizationSettings | null> {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('id, organization_name_ar, organization_name_en, address_ar, phone, email, logo_url, vat_registration_number, commercial_registration_number')
      .maybeSingle();

    if (error) throw error;
    return data as OrganizationSettings | null;
  },

  /**
   * الحصول على رابط عام للملف من Storage
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
