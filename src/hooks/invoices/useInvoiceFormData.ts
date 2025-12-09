/**
 * Invoice Form Data Hooks
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "@/lib/date";

export function useRevenueAccounts() {
  return useQuery({
    queryKey: ["revenue-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_type", "revenue")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ["next-invoice-number"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return `INV-${format(new Date(), "yyyy")}-001`;
      }
      
      const lastNumber = parseInt(data.invoice_number.split("-")[2]);
      const newNumber = (lastNumber + 1).toString().padStart(3, "0");
      return `INV-${format(new Date(), "yyyy")}-${newNumber}`;
    },
  });
}
