import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface RentalPayment {
  id: string;
  payment_number: string;
  contract_id: string;
  due_date: string;
  payment_date?: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  payment_method?: string;
  late_fee: number;
  discount: number;
  receipt_number?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  contracts?: {
    contract_number: string;
    tenant_name: string;
    properties: {
      name: string;
    };
  };
}

export const useRentalPayments = (contractId?: string) => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["rental_payments", contractId],
    queryFn: async () => {
      let query = supabase
        .from("rental_payments")
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            properties(name)
          )
        `)
        .order("due_date", { ascending: false });

      if (contractId) {
        query = query.eq("contract_id", contractId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RentalPayment[];
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: any) => {
      const { data, error } = await supabase
        .from("rental_payments")
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      toast({
        title: "تم إضافة الدفعة",
        description: "تم إضافة الدفعة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الدفعة",
        variant: "destructive",
      });
      console.error("Error adding payment:", error);
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...payment }: Partial<RentalPayment> & { id: string }) => {
      const { data, error } = await supabase
        .from("rental_payments")
        .update(payment)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      toast({
        title: "تم تحديث الدفعة",
        description: "تم تحديث الدفعة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
      console.error("Error updating payment:", error);
    },
  });

  return {
    payments,
    isLoading,
    addPayment,
    updatePayment,
  };
};