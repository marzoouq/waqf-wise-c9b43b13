import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WaqfDistributionSettings } from "@/types/distribution/index";

export function useDistributionSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["distribution-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waqf_distribution_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as WaqfDistributionSettings | null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<WaqfDistributionSettings> & { calculation_order?: string }) => {
      if (settings?.id) {
        const { data, error } = await supabase
          .from("waqf_distribution_settings")
          .update(updates)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("waqf_distribution_settings")
          .insert([updates])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-settings"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث إعدادات التوزيع",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
  };
}
