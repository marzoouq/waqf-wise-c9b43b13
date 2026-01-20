/**
 * Rental Payment Service - خدمة دفعات الإيجار
 * @version 2.8.51
 */

import { supabase } from "@/integrations/supabase/client";
import type { RentalPaymentInsert, RentalPaymentUpdate } from "@/types/payments";
import type { Database } from "@/integrations/supabase/types";

// Types from database
type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
type InvoiceLineRow = Database['public']['Tables']['invoice_lines']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type OrganizationSettingsRow = Database['public']['Tables']['organization_settings']['Row'];

export type InvoiceWithLines = InvoiceRow & {
  invoice_lines: InvoiceLineRow[];
};

export type PaymentRecord = PaymentRow;
export type OrganizationSettingsRecord = OrganizationSettingsRow;

export interface RentalPayment {
  id: string;
  payment_number: string;
  contract_id: string;
  due_date: string;
  payment_date?: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  payment_method?: string;
  late_fee: number;
  discount: number;
  receipt_number?: string;
  notes?: string;
  journal_entry_id?: string;
  invoice_id?: string;
  receipt_id?: string;
  created_at: string;
  updated_at: string;
  contracts?: {
    contract_number: string;
    tenant_name: string;
    tenant_id_number?: string;
    tenant_email?: string;
    tenant_phone?: string;
    properties: {
      name: string;
    };
  };
}

export interface RentalPaymentFilters {
  contractId?: string;
}

const RENTAL_PAYMENT_SELECT = `
  *,
  contracts(
    contract_number,
    tenant_name,
    tenant_id_number,
    tenant_email,
    tenant_phone,
    properties(name)
  )
`;

export class RentalPaymentService {
  /**
   * جلب جميع دفعات الإيجار
   */
  static async getAll(filters?: RentalPaymentFilters): Promise<RentalPayment[]> {
    let query = supabase
      .from("rental_payments")
      .select(RENTAL_PAYMENT_SELECT)
      .is("deleted_at", null) // استبعاد المحذوفة
      .order("due_date", { ascending: false });

    if (filters?.contractId) {
      query = query.eq("contract_id", filters.contractId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as RentalPayment[];
  }

  /**
   * جلب دفعة بالمعرف
   */
  static async getById(id: string): Promise<RentalPayment | null> {
    const { data, error } = await supabase
      .from("rental_payments")
      .select(RENTAL_PAYMENT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as RentalPayment | null;
  }

  /**
   * إنشاء دفعة جديدة
   */
  static async create(payment: Omit<RentalPaymentInsert, 'payment_number'>): Promise<RentalPayment> {
    const paymentNumber = `RP-${Date.now().toString().slice(-8)}`;
    
    const { data, error } = await supabase
      .from("rental_payments")
      .insert([{ ...payment, payment_number: paymentNumber }])
      .select(RENTAL_PAYMENT_SELECT)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء الدفعة');
    return data as RentalPayment;
  }

  /**
   * تحديث دفعة
   */
  static async update(id: string, updates: Partial<RentalPayment>): Promise<RentalPayment | null> {
    const { data, error } = await supabase
      .from("rental_payments")
      .update(updates)
      .eq("id", id)
      .select(RENTAL_PAYMENT_SELECT)
      .maybeSingle();

    if (error) throw error;
    return data as RentalPayment | null;
  }

  /**
   * حذف دفعة (Soft Delete - الحذف اللين)
   * ⚠️ الحذف الفيزيائي ممنوع شرعاً في نظام الوقف المالي
   */
  static async delete(id: string, reason: string = 'تم الإلغاء'): Promise<void> {
    // الحصول على معرف المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();
    
    // Soft Delete بدلاً من الحذف الفيزيائي
    const { error } = await supabase
      .from("rental_payments")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
        deletion_reason: reason,
      })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * جلب البيانات القديمة للدفعة (للمقارنة)
   */
  static async getOldData(id: string): Promise<{
    amount_paid: number;
    payment_date: string | null;
    invoice_id: string | null;
    receipt_id: string | null;
    contract_id: string;
  } | null> {
    const { data, error } = await supabase
      .from("rental_payments")
      .select("amount_paid, payment_date, invoice_id, receipt_id, contract_id")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * إنشاء فاتورة وسند قبض عبر RPC
   */
  static async createInvoiceAndReceipt(params: {
    rentalPaymentId: string;
    contractId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    tenantName?: string;
    tenantId?: string;
    tenantEmail?: string;
    tenantPhone?: string;
    propertyName?: string;
  }): Promise<{ success: boolean; invoice_id?: string; receipt_id?: string }> {
    const { data, error } = await supabase.rpc(
      'create_rental_invoice_and_receipt',
      {
        p_rental_payment_id: params.rentalPaymentId,
        p_contract_id: params.contractId,
        p_amount: params.amount,
        p_payment_date: params.paymentDate,
        p_payment_method: params.paymentMethod,
        p_tenant_name: params.tenantName,
        p_tenant_id: params.tenantId,
        p_tenant_email: params.tenantEmail,
        p_tenant_phone: params.tenantPhone,
        p_property_name: params.propertyName
      }
    );

    if (error) throw error;
    
    if (data && data.length > 0 && data[0].success) {
      return {
        success: true,
        invoice_id: data[0].invoice_id,
        receipt_id: data[0].receipt_id
      };
    }
    
    return { success: false };
  }

  /**
   * جلب بيانات الفاتورة مع البنود
   */
  static async getInvoiceWithLines(invoiceId: string): Promise<InvoiceWithLines | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)')
      .eq('id', invoiceId)
      .maybeSingle();

    if (error) throw error;
    return data as InvoiceWithLines | null;
  }

  /**
   * جلب بيانات سند القبض
   */
  static async getReceipt(receiptId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', receiptId)
      .maybeSingle();

    if (error) throw error;
    return data as PaymentRecord | null;
  }

  /**
   * جلب إعدادات المنظمة
   */
  static async getOrganizationSettings(): Promise<OrganizationSettingsRecord | null> {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
