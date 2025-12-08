/**
 * Hook لإدارة الفواتير
 * Invoices Hook
 */

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, InvoiceSummary } from '@/services/invoice.service';

export type { InvoiceSummary as Invoice };

export function useInvoices() {
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => InvoiceService.getInvoiceSummaries(),
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