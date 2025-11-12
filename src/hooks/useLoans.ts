import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "./useActivities";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface Loan {
  id: string;
  beneficiary_id: string;
  loan_number: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  monthly_installment: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'paid' | 'defaulted' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  beneficiary?: {
    id: string;
    full_name: string;
    national_id: string;
    phone: string;
  };
}

export function useLoans(beneficiaryId?: string) {
  const { toast } = useToast();
  const { addActivity } = useActivities();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('loans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loans'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch loans
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', beneficiaryId],
    queryFn: async () => {
      let query = supabase
        .from('loans')
        .select(`
          *,
          beneficiary:beneficiaries(id, full_name, national_id, phone)
        `)
        .order('created_at', { ascending: false });

      if (beneficiaryId) {
        query = query.eq('beneficiary_id', beneficiaryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Loan[];
    },
  });

  // Add loan mutation
  const addLoan = useMutation({
    mutationFn: async (loan: Omit<Loan, 'id' | 'loan_number' | 'created_at' | 'updated_at' | 'beneficiary' | 'monthly_installment'>) => {
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .insert([{
          ...loan,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (loanError) throw loanError;

      // Calculate installment schedule
      const { error: scheduleError } = await supabase.rpc('calculate_loan_schedule', {
        p_loan_id: loanData.id,
        p_principal: loan.loan_amount,
        p_interest_rate: loan.interest_rate || 0,
        p_term_months: loan.term_months,
        p_start_date: loan.start_date
      });

      if (scheduleError) throw scheduleError;

      return loanData;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan_installments'] });
      
      await addActivity({
        action: `تم إضافة قرض جديد: ${data.loan_number}`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      });

      toast({
        title: "تم إضافة القرض بنجاح",
        description: `رقم القرض: ${data.loan_number}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة القرض",
        description: error.message,
      });
    },
  });

  // Update loan mutation
  const updateLoan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      
      await addActivity({
        action: `تم تحديث القرض: ${data.loan_number}`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      });

      toast({
        title: "تم تحديث القرض بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث القرض",
        description: error.message,
      });
    },
  });

  // Delete loan mutation
  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      
      await addActivity({
        action: 'تم حذف قرض',
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      });

      toast({
        title: "تم حذف القرض بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف القرض",
        description: error.message,
      });
    },
  });

  return {
    loans,
    isLoading,
    addLoan: addLoan.mutateAsync,
    updateLoan: updateLoan.mutateAsync,
    deleteLoan: deleteLoan.mutateAsync,
  };
}
