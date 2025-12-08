/**
 * Invoice Service - خدمة الفواتير
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

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

  static async create(invoice: InvoiceInsert): Promise<Invoice> {
    const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
    if (error) throw error;
    return data;
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
