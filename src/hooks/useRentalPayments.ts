import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";

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
  const { createAutoEntry } = useJournalEntries();

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
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            properties(name)
          )
        `)
        .single();

      if (error) throw error;

      // إنشاء قيد محاسبي تلقائي إذا تم الدفع
      if (data && data.amount_paid > 0 && data.payment_date) {
        try {
          await createAutoEntry(
            "rental_payment",
            data.id,
            data.amount_paid,
            `إيراد إيجار - ${data.payment_number}`,
            data.payment_date
          );
        } catch (journalError) {
          console.error("Error creating journal entry:", journalError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم إضافة الدفعة",
        description: "تم إضافة الدفعة وإنشاء القيد المحاسبي",
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
      // جلب البيانات القديمة
      const { data: oldData } = await supabase
        .from("rental_payments")
        .select("amount_paid, payment_date")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("rental_payments")
        .update(payment)
        .eq("id", id)
        .select(`
          *,
          contracts(
            contract_number,
            tenant_name,
            properties(name)
          )
        `)
        .single();

      if (error) throw error;

      // إنشاء قيد محاسبي إذا تم الدفع لأول مرة أو تحديث المبلغ
      const isNewPayment = oldData && oldData.amount_paid === 0 && data.amount_paid > 0;
      const isPaymentUpdate = oldData && data.amount_paid !== oldData.amount_paid && data.amount_paid > 0;

      if (data && (isNewPayment || isPaymentUpdate) && data.payment_date) {
        try {
          await createAutoEntry(
            "rental_payment",
            data.id,
            data.amount_paid,
            `إيراد إيجار - ${data.payment_number}`,
            data.payment_date
          );
        } catch (journalError) {
          console.error("Error creating journal entry:", journalError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم تحديث الدفعة",
        description: "تم تحديث الدفعة والقيد المحاسبي",
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