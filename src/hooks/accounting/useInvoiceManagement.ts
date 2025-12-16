/**
 * useInvoiceManagement Hook
 * Hook لإدارة الفواتير
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { useToast } from "@/hooks/ui/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  customer_name: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
}

export function useInvoiceManagement(statusFilter: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.INVOICES, statusFilter],
    queryFn: async () => {
      const data = await AccountingService.getInvoices(statusFilter);
      return data as Invoice[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await AccountingService.updateInvoiceStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الفاتورة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الفاتورة",
        variant: "destructive",
      });
    },
  });

  const updateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  return {
    invoices,
    isLoading,
    error,
    refetch,
    updateStatus,
    isUpdating: updateStatusMutation.isPending,
  };
}
