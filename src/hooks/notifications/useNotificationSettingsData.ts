/**
 * Hook for NotificationSettings data fetching and mutation
 * يجلب ويحدث إعدادات الإشعارات للمستخدم
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/types/notifications";
import { NotificationSettingsService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useNotificationSettingsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION_SETTINGS,
    queryFn: () => NotificationSettingsService.getSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: (updates: Partial<NotificationSettings>) =>
      NotificationSettingsService.updateSettings(settings?.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION_SETTINGS });
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الإشعارات بنجاح",
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

  const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  return {
    settings,
    isLoading,
    error,
    handleToggle,
    isUpdating: updateSettings.isPending,
  };
}
