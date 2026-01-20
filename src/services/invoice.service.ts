/**
 * Invoice Service - خدمة الفواتير
 * @version 2.8.24
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { matchesStatus } from '@/lib/constants';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceLine = Database['public']['Tables']['invoice_lines']['Insert'];

export interface InvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  total_amount: number;
  status: string;
  zatca_status: string | null;
  is_zatca_compliant: boolean;
  created_at: string;
}

export class InvoiceService {
  static async getAll(filters?: { status?: string }): Promise<Invoice[]> {
    let query = supabase.from('invoices').select('*')
      .is('deleted_at', null) // استبعاد المحذوفة
      .order('invoice_date', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب ملخص الفواتير للعرض
   */
  static async getInvoiceSummaries(): Promise<InvoiceSummary[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, invoice_date, customer_name, total_amount, status, zatca_status, is_zatca_compliant, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as InvoiceSummary[];
  }

  static async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async getWithLines(id: string) {
    const { data, error } = await supabase.from('invoices').select('*, invoice_lines(*)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  static async create(invoice: InvoiceInsert, lines?: InvoiceLine[]): Promise<Invoice> {
    const invoiceToInsert = { ...invoice };
    if (!invoiceToInsert.invoice_number || invoiceToInsert.invoice_number.trim() === '') {
      delete invoiceToInsert.invoice_number;
    }
    
    const { data: invoiceRecord, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceToInsert])
      .select()
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoiceRecord) throw new Error('فشل في إنشاء الفاتورة');

    if (lines && lines.length > 0) {
      const linesWithInvoiceId = lines.map((line) => ({
        ...line,
        invoice_id: invoiceRecord.id,
      }));

      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(linesWithInvoiceId);

      if (linesError) throw linesError;
    }

    return invoiceRecord;
  }

  static async update(id: string, invoice: Partial<Invoice>, lines?: InvoiceLine[]): Promise<Invoice> {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoiceData) throw new Error('فشل في تحديث الفاتورة');

    if (lines && lines.length > 0) {
      await supabase.from('invoice_lines').delete().eq('invoice_id', id);

      const linesWithInvoiceId = lines.map((line) => ({
        ...line,
        invoice_id: id,
      }));

      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(linesWithInvoiceId);

      if (linesError) throw linesError;
    }

    return invoiceData;
  }

  /**
   * حذف فاتورة (Soft Delete - الحذف اللين)
   * ⚠️ الحذف الفيزيائي ممنوع شرعاً في نظام الوقف المالي
   */
  static async delete(id: string, reason: string = 'تم الإلغاء'): Promise<void> {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('status, journal_entry_id')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (!invoice) throw new Error('الفاتورة غير موجودة أو محذوفة مسبقاً');
    
    if (matchesStatus(invoice.status, 'paid')) {
      throw new Error('لا يمكن حذف فاتورة مدفوعة');
    }
    
    // الحصول على معرف المستخدم الحالي
    const { data: { user } } = await supabase.auth.getUser();
    
    // Soft Delete للقيد المحاسبي المرتبط
    if (invoice.journal_entry_id) {
      await supabase.from('journal_entries').update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id || null,
        deletion_reason: `حذف مرتبط بفاتورة: ${reason}`,
      }).eq('id', invoice.journal_entry_id);
    }
    
    // Soft Delete للفاتورة
    const { error } = await supabase.from('invoices').update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id || null,
      deletion_reason: reason,
    }).eq('id', id);
    
    if (error) throw error;
  }

  static async updateStatus(id: string, status: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from('invoices').update({ status }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("الفاتورة غير موجودة");
    return data;
  }

  static async generateNextNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).like('invoice_number', `INV-${year}-%`);
    return `INV-${year}-${((count || 0) + 1).toString().padStart(6, '0')}`;
  }

  static async getSummary() {
    const { data } = await supabase.from('invoices').select('status, total_amount');
    const invoices = data || [];
    return {
      total: invoices.length,
      paid: invoices.filter(i => matchesStatus(i.status, 'paid')).length,
      totalAmount: invoices.reduce((s, i) => s + (i.total_amount || 0), 0),
    };
  }

  /**
   * جلب رقم الفاتورة التالي
   */
  static async getNextInvoiceNumber(): Promise<string> {
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    
    const year = new Date().getFullYear();
    if (!data) {
      return `INV-${year}-001`;
    }
    
    const parts = data.invoice_number?.split("-") || [];
    const lastNumber = parseInt(parts[2] || "0");
    const newNumber = (lastNumber + 1).toString().padStart(3, "0");
    return `INV-${year}-${newNumber}`;
  }

  /**
   * جلب تفاصيل الفاتورة
   */
  static async getInvoiceDetails(invoiceId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /**
   * جلب أسطر الفاتورة
   */
  static async getInvoiceLines(invoiceId: string) {
    const { data, error } = await supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("line_number");
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب حسابات الإيرادات
   */
  static async getRevenueAccounts() {
    const { data, error } = await supabase
      .from("accounts")
      .select("id, code, name_ar")
      .eq("account_type", "revenue")
      .eq("is_active", true)
      .eq("is_header", false)
      .order("code");
    if (error) throw error;
    return data || [];
  }
}
