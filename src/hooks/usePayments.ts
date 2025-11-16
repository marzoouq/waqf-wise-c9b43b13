import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

export interface Payment {
  id: string;
  payment_type: "receipt" | "payment";
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "card";
  payer_name: string;
  reference_number?: string;
  description: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["payments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    staleTime: 3 * 60 * 1000,
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => {
      // التحقق من حاجة المدفوعة للموافقة
      const { data: requiresApproval } = await supabase.rpc(
        'payment_requires_approval' as never,
        { p_amount: payment.amount }
      );

      const paymentStatus = requiresApproval ? 'pending' : 'completed';

      const { data, error } = await supabase
        .from("payments")
        .insert([{ ...payment, status: paymentStatus }])
        .select()
        .single();

      if (error) throw error;

      // إذا كانت تحتاج موافقة، إنشاء موافقات (مستويين)
      if (requiresApproval) {
        const approvals = [
          { level: 1, approver_name: 'المشرف المالي' },
          { level: 2, approver_name: 'المدير' }
        ];

        await supabase.from('payment_approvals').insert(
          approvals.map(approval => ({
            payment_id: data.id,
            ...approval,
            status: 'معلق'
          }))
        );
      }

      // إنشاء قيد محاسبي تلقائي للمدفوعات (فقط إذا لم تحتاج موافقة أو تمت الموافقة)
      if (data && data.amount && data.payment_date && paymentStatus === 'completed') {
        try {
          const entryId = await createAutoEntry(
            data.payment_type === "قبض" ? "payment_receipt" : "payment_voucher",
            data.id,
            data.amount,
            `${data.payment_type} - ${data.description} - ${data.payer_name}`,
            data.payment_date
          );

          // تحديث رقم القيد في الدفعة
          if (entryId) {
            await supabase
              .from("payments")
              .update({ journal_entry_id: entryId })
              .eq("id", data.id);
          }
        } catch (journalError) {
          logger.error(journalError, { context: 'payment_journal_entry', severity: 'medium' });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة السند وإنشاء القيد المحاسبي",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "حدث خطأ أثناء إضافة السند",
        variant: "destructive",
      });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      // الحصول على البيانات القديمة
      const { data: oldPayment } = await supabase
        .from("payments")
        .select("journal_entry_id, amount, payment_date")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // إنشاء قيد محاسبي جديد إذا لم يكن موجوداً وتم تحديث المبلغ
      if (!oldPayment?.journal_entry_id && data.amount && data.payment_date) {
        try {
          const entryId = await createAutoEntry(
            data.payment_type === "قبض" ? "payment_receipt" : "payment_voucher",
            data.id,
            data.amount,
            `${data.payment_type} - ${data.description} - ${data.payer_name}`,
            data.payment_date
          );

          if (entryId) {
            await supabase
              .from("payments")
              .update({ journal_entry_id: entryId })
              .eq("id", id);
          }
        } catch (journalError) {
          logger.error(journalError, { context: 'update_payment_journal_entry', severity: 'medium' });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات السند بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث السند",
        variant: "destructive",
      });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف السند بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف السند",
        variant: "destructive",
      });
    },
  });

  return {
    payments,
    isLoading,
    addPayment: addPayment.mutateAsync,
    updatePayment: updatePayment.mutateAsync,
    deletePayment: deletePayment.mutateAsync,
  };
}
