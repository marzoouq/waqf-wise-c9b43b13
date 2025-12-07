import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BeneficiaryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useBeneficiaryCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["beneficiary-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as BeneficiaryCategory[];
    },
  });

  const activeCategories = categories.filter(c => c.is_active);

  return {
    categories,
    activeCategories,
    isLoading,
  };
}
