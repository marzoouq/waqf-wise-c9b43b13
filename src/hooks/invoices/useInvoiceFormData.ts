/**
 * Invoice Form Data Hooks
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService, InvoiceService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useRevenueAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.REVENUE_ACCOUNTS,
    queryFn: () => AccountingService.getRevenueAccounts(),
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: QUERY_KEYS.NEXT_INVOICE_NUMBER,
    queryFn: () => InvoiceService.getNextInvoiceNumber(),
  });
}
