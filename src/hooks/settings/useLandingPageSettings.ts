/**
 * Hook for LandingPageSettings data fetching and mutation
 * يجلب ويحدث إعدادات الصفحة الترحيبية
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LandingSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_active: boolean;
}

export function useLandingPageSettings() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['landing-page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data as LandingSetting[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('landing_page_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
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
      return setting.setting_value as string;
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
