import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type?: string;
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings" as any)
        .select("*")
        .order("setting_key");

      if (error) throw error;
      return (data || []) as unknown as SystemSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("system_settings" as any)
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system_settings"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعداد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string): string | undefined => {
    return settings.find(s => s.setting_key === key)?.setting_value;
  };

  const getPaymentApprovalThreshold = (): number => {
    const threshold = getSetting('payment_approval_threshold');
    return threshold ? Number(threshold) : 50000;
  };

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutateAsync,
    getSetting,
    getPaymentApprovalThreshold,
  };
}
