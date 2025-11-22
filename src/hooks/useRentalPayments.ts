import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errorHandling";
import type { RentalPaymentInsert, RentalPaymentUpdate } from "@/types/payments";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect, useMemo } from "react";
import { logger } from "@/lib/logger";

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

// Filter relevant payments based on days threshold
const filterRelevantPayments = (payments: RentalPayment[], daysThreshold: number = 90) => {
  const now = new Date();
  const futureThreshold = new Date();
  futureThreshold.setDate(futureThreshold.getDate() + daysThreshold);

  return payments.filter(payment => {
    const dueDate = new Date(payment.due_date);
    
    // Show paid payments (historical record)
    if (payment.payment_date) return true;
    
    // Show overdue payments
    if (dueDate < now) return true;
    
    // Show payments due within threshold days
    if (dueDate <= futureThreshold) return true;
    
    // Hide distant future payments
    return false;
  });
};

// Filter to show only the next upcoming payment per contract
const filterNextPaymentPerContract = (payments: RentalPayment[]) => {
  const now = new Date();
  
  // Group payments by contract
  const paymentsByContract = payments.reduce((acc, payment) => {
    const contractId = payment.contract_id;
    if (!acc[contractId]) {
      acc[contractId] = [];
    }
    acc[contractId].push(payment);
    return acc;
  }, {} as Record<string, RentalPayment[]>);

  // For each contract, keep paid, overdue, and only the next upcoming payment
  const result: RentalPayment[] = [];
  
  Object.values(paymentsByContract).forEach((contractPayments) => {
    // Sort by due date
    const sorted = [...contractPayments].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    // Add paid payments
    const paid = sorted.filter(p => p.payment_date);
    result.push(...paid);

    // Add overdue payments
    const overdue = sorted.filter(p => !p.payment_date && new Date(p.due_date) < now);
    result.push(...overdue);

    // Find and add only the next upcoming payment
    const upcoming = sorted.filter(p => !p.payment_date && new Date(p.due_date) >= now);
    if (upcoming.length > 0) {
      result.push(upcoming[0]); // Only the closest upcoming payment
    }
  });

  return result;
};

export const useRentalPayments = (
  contractId?: string, 
  showAllPayments: boolean = false, 
  daysThreshold: number = 90,
  showNextOnly: boolean = true
) => {
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('rental-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rental_payments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rental_payments"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: allPayments, isLoading } = useQuery({
    queryKey: ["rental_payments", contractId || undefined],
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

  // Apply filtering logic
  const payments = useMemo(
    () => {
      if (!allPayments) return [];
      
      // If showing all payments without filters
      if (showAllPayments) return allPayments;
      
      // If showing only next payment per contract (default)
      if (showNextOnly) {
        return filterNextPaymentPerContract(allPayments);
      }
      
      // Otherwise use threshold filtering
      return filterRelevantPayments(allPayments, daysThreshold);
    },
    [allPayments, showAllPayments, showNextOnly, daysThreshold]
  );

  const hiddenPaymentsCount = useMemo(
    () => {
      if (!allPayments || !payments) return 0;
      return allPayments.length - payments.length;
    },
    [allPayments, payments]
  );

  const addPayment = useMutation({
    mutationKey: ['add_rental_payment'],
    mutationFn: async (payment: Omit<RentalPaymentInsert, 'payment_number'>) => {
      const paymentNumber = `RP-${Date.now().toString().slice(-8)}`;
      const { data, error } = await supabase
        .from("rental_payments")
        .insert([{ ...payment, payment_number: paymentNumber }])
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
          logger.error(journalError, { context: 'rental_payment_journal_entry', severity: 'medium' });
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
    onError: createMutationErrorHandler({ context: 'add_rental_payment' }),
  });

  const updatePayment = useMutation({
    mutationKey: ['update_rental_payment'],
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
          logger.error(journalError, { context: 'update_rental_payment_journal', severity: 'medium' });
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
      logger.error(error, { context: 'update_rental_payment', severity: 'medium' });
    },
  });

  return {
    payments,
    allPayments,
    hiddenPaymentsCount,
    isLoading,
    addPayment,
    updatePayment,
  };
};