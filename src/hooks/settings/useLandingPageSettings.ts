/**
 * Hook for LandingPageSettings data fetching and mutation
 * يجلب ويحدث إعدادات الصفحة الترحيبية
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SettingsService } from "@/services";

export function useLandingPageSettings() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['landing-page-settings'],
    queryFn: () => SettingsService.getLandingSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return SettingsService.updateSetting(key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: () => {
      toast.error('فشل حفظ الإعدادات');
    }
  });

  const handleChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = editedSettings[key];
    if (value !== undefined) {
      const jsonValue = JSON.stringify(value);
      updateMutation.mutate({ key, value: jsonValue });
    }
  };

  const getValue = (key: string): string => {
    if (editedSettings[key] !== undefined) {
      return editedSettings[key];
    }
    const setting = settings?.find(s => s.setting_key === key);
    if (!setting) return '';
    try {
      return JSON.parse(setting.setting_value as string);
    } catch {
      return String(setting.setting_value);
    }
  };

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ['landing-page-settings'] });
  };

  return {
    settings,
    isLoading,
    error,
    editedSettings,
    handleChange,
    handleSave,
    getValue,
    refreshSettings,
    isSaving: updateMutation.isPending,
  };
}
