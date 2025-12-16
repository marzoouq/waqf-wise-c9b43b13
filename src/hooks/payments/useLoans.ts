import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { LoansService } from "@/services";
import type { Database } from "@/integrations/supabase/types";
import { QUERY_KEYS } from "@/lib/query-keys";

export type Loan = Database['public']['Tables']['loans']['Row'] & {
  beneficiaries?: {
    full_name: string;
    national_id: string;
  };
  beneficiary?: {
    full_name: string;
    national_id: string;
  };
};

export function useLoans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.LOANS,
    queryFn: () => LoansService.getAllWithBeneficiary(),
  });

  const addLoan = useMutation({
    mutationFn: (loan: Database['public']['Tables']['loans']['Insert']) => 
      LoansService.create(loan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      toast({
        title: "تم إضافة القرض",
        description: "تم إضافة القرض بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLoan = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Loan> & { id: string }) => 
      LoansService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS });
      toast({
        title: "تم التحديث",
        description: "تم تحديث القرض بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    loans: loans as Loan[],
    isLoading,
    addLoan: addLoan.mutate,
    updateLoan: updateLoan.mutate,
  };
}
