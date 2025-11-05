import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Distribution {
  id: string;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useDistributions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select("*")
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return data as Distribution[];
    },
    staleTime: 3 * 60 * 1000, // Data stays fresh for 3 minutes
  });

  const addDistribution = useMutation({
    mutationFn: async (distribution: Omit<Distribution, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("distributions")
        .insert([distribution])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast({
        title: "تم إنشاء التوزيع بنجاح",
        description: "تم إنشاء التوزيع الجديد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "حدث خطأ أثناء إنشاء التوزيع",
        variant: "destructive",
      });
    },
  });

  return {
    distributions,
    isLoading,
    addDistribution: addDistribution.mutateAsync,
  };
}
