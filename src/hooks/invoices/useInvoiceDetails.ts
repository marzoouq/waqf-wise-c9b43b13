/**
 * Invoice Details Hook
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { InvoiceService } from "@/services";

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_amount?: number;
  subtotal?: number;
  tax_rate?: number;
}

export function useInvoiceDetails(invoiceId: string | null) {
  const invoiceQuery = useQuery({
    queryKey: ["invoice", invoiceId || undefined],
    queryFn: async () => {
      if (!invoiceId) return null;
      return InvoiceService.getInvoiceDetails(invoiceId);
    },
    enabled: !!invoiceId,
  });

  const linesQuery = useQuery({
    queryKey: ["invoice-lines", invoiceId || undefined],
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
