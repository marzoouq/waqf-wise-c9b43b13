/**
 * Invoice Service - خدمة الفواتير
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

type InvoiceLine = Database['public']['Tables']['invoice_lines']['Insert'];

export class InvoiceService {
  static async getAll(filters?: { status?: string }): Promise<Invoice[]> {
    let query = supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async getWithLines(id: string) {
    const { data, error } = await supabase.from('invoices').select('*, invoice_lines(*)').eq('id', id).single();
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

  static async delete(id: string): Promise<void> {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('status, journal_entry_id')
      .eq('id', id)
      .maybeSingle();
    
    if (!invoice) throw new Error('الفاتورة غير موجودة');
    
    if (invoice.status === 'paid') {
      throw new Error('لا يمكن حذف فاتورة مدفوعة');
    }
    
    await supabase.from('invoice_lines').delete().eq('invoice_id', id);
    
    if (invoice.journal_entry_id) {
      await supabase.from('journal_entries').delete().eq('id', invoice.journal_entry_id);
    }
    
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
  }

  static async updateStatus(id: string, status: string): Promise<Invoice> {
    const { data, error } = await supabase.from('invoices').update({ status }).eq('id', id).select().single();
    if (error) throw error;
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
      paid: invoices.filter(i => i.status === 'paid').length,
      totalAmount: invoices.reduce((s, i) => s + (i.total_amount || 0), 0),
    };
  }
}
