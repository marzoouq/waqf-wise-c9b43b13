import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SystemService, type SystemSetting } from "@/services/system.service";
import { useToast } from "@/hooks/ui/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export type { SystemSetting };

export function useSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.SYSTEM_SETTINGS,
    queryFn: () => SystemService.getSettings(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      SystemService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_SETTINGS });
      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعداد بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'update_system_settings',
      toastTitle: "خطأ"
    }),
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
    error,
    refetch,
    updateSetting: updateSetting.mutateAsync,
    getSetting,
    getPaymentApprovalThreshold,
  };
}
