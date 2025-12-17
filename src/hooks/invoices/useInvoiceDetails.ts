/**
 * Invoice Details Hook
 * @version 2.9.43
 */

import { useQuery } from "@tanstack/react-query";
import { InvoiceService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { InvoiceLine } from "@/types/invoice-line";

// إعادة تصدير النوع للتوافق مع الكود القديم
export type { InvoiceLine } from "@/types/invoice-line";

export function useInvoiceDetails(invoiceId: string | null) {
  const invoiceQuery = useQuery({
    queryKey: QUERY_KEYS.INVOICE(invoiceId || ''),
    queryFn: async () => {
      if (!invoiceId) return null;
      return InvoiceService.getInvoiceDetails(invoiceId);
    },
    enabled: !!invoiceId,
  });

  const linesQuery = useQuery({
    queryKey: QUERY_KEYS.INVOICE_LINES(invoiceId || ''),
    queryFn: async () => {
      if (!invoiceId) return [];
      return InvoiceService.getInvoiceLines(invoiceId) as Promise<InvoiceLine[]>;
    },
    enabled: !!invoiceId,
  });

  return {
    invoice: invoiceQuery.data,
    invoiceLines: linesQuery.data || [],
    isLoading: invoiceQuery.isLoading || linesQuery.isLoading,
    invoiceLoading: invoiceQuery.isLoading,
    linesLoading: linesQuery.isLoading,
  };
}
