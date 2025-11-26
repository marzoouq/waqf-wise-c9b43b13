import { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Insert'];

export const mockInvoices = (): Invoice[] => [
  {
    invoice_number: 'INV-2024-001',
    invoice_date: '2024-11-01',
    customer_name: 'شركة الصيانة المتقدمة',
    total_amount: 11500,
    tax_amount: 1500,
    status: 'paid',
  },
  {
    invoice_number: 'INV-2024-002',
    invoice_date: '2024-11-10',
    customer_name: 'مؤسسة الخدمات العامة',
    total_amount: 5750,
    tax_amount: 750,
    status: 'issued',
  },
];

export const mockInvoiceLines = (invoiceIds: string[]) => {
  return invoiceIds.map((invoiceId, index) => ({
    invoice_id: invoiceId,
    line_number: 1,
    description: `خدمة ${index + 1}`,
    quantity: 1,
    unit_price: 10000,
    line_total: 11500,
  }));
};
