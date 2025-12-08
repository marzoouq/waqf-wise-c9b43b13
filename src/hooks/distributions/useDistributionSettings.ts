import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { WaqfDistributionSettings } from "@/types/distributions";
import { FundService } from "@/services/fund.service";

export function useDistributionSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["distribution-settings"],
    queryFn: () => FundService.getDistributionSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: (updates: Partial<WaqfDistributionSettings> & { calculation_order?: string }) => 
      FundService.updateDistributionSettings(settings?.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-settings"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث إعدادات التوزيع",
      });
    },
    onError: (error: Error) => {
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
