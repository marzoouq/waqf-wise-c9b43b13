/**
 * Invoice Details Hook
 * @version 2.8.40
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId,
  });

  const linesQuery = useQuery({
    queryKey: ["invoice-lines", invoiceId || undefined],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("line_number");
      if (error) throw error;
      return data as InvoiceLine[];
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
