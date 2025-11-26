import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

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
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          beneficiaries (
            full_name,
            national_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
  });

  const addLoan = useMutation({
    mutationFn: async (loan: Database['public']['Tables']['loans']['Insert']) => {
      const { data, error } = await supabase
        .from("loans")
        .insert([loan])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
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
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { data, error } = await supabase
        .from("loans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
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
    loans,
    isLoading,
    addLoan: addLoan.mutate,
    updateLoan: updateLoan.mutate,
  };
}
