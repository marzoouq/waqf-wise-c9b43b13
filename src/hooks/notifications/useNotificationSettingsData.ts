/**
 * Hook for NotificationSettings data fetching and mutation
 * يجلب ويحدث إعدادات الإشعارات للمستخدم
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/types/notifications";
import { supabase } from "@/integrations/supabase/client";

export function useNotificationSettingsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationSettings | null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (settings?.id) {
        const { data, error } = await supabase
          .from("notification_settings")
          .update(updates)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("notification_settings")
          .insert([{ ...updates, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
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
