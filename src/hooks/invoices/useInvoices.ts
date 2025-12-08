/**
 * Hook لإدارة الفواتير
 * Invoices Hook
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
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

export function useInvoices() {
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, invoice_date, customer_name, total_amount, status, zatca_status, is_zatca_compliant, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });

  // الإحصائيات
  const stats = {
    total: invoices?.length || 0,
    zatcaCompliant: invoices?.filter(i => i.is_zatca_compliant).length || 0,
    accepted: invoices?.filter(i => i.zatca_status === 'accepted').length || 0,
    pending: invoices?.filter(i => i.zatca_status === 'pending' || !i.zatca_status).length || 0,
  };

  return {
    invoices: invoices || [],
    isLoading,
    error,
    stats,
    refetch,
  };
}
