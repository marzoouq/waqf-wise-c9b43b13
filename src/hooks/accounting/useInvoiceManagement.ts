/**
 * useInvoiceManagement Hook
 * Hook لإدارة الفواتير
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    queryKey: ["invoices", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("*")
        .order("invoice_date", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
