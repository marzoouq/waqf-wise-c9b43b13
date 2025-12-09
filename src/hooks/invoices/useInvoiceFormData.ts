/**
 * Invoice Form Data Hooks
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { AccountingService, InvoiceService } from "@/services";

export function useRevenueAccounts() {
  return useQuery({
    queryKey: ["revenue-accounts"],
    queryFn: () => AccountingService.getRevenueAccounts(),
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ["next-invoice-number"],
    queryFn: () => InvoiceService.getNextInvoiceNumber(),
  });
}
