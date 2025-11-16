import type { Database } from '@/integrations/supabase/types';

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceLine = Database['public']['Tables']['invoice_lines']['Row'];

export interface InvoiceInsert {
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status?: string;
  notes?: string;
}

export interface InvoiceLineInsert {
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  account_id?: string;
}

export interface InvoiceWithLines {
  invoice: InvoiceInsert;
  lines: InvoiceLineInsert[];
}
