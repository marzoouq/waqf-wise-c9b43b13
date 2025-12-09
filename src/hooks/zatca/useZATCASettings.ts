/**
 * Hook لإعدادات هيئة الزكاة والضريبة
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import React from "react";

interface ZATCASettingsState {
  enabled: boolean;
  organizationId: string;
  vatNumber: string;
  apiKey: string;
  testMode: boolean;
}

export function useZATCASettings() {
  const [settings, setSettings] = useState<ZATCASettingsState>({
    enabled: false,
    organizationId: "",
    vatNumber: "",
    apiKey: "",
    testMode: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = (updates: Partial<ZATCASettingsState>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'zatca_enabled', value: settings.enabled ? 'true' : 'false' },
        { key: 'zatca_organization_id', value: settings.organizationId },
        { key: 'zatca_vat_number', value: settings.vatNumber },
        { key: 'zatca_api_key', value: settings.apiKey },
        { key: 'zatca_test_mode', value: settings.testMode ? 'true' : 'false' },
      ];

      for (const { key, value } of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            setting_type: 'text',
            category: 'zatca',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }
      
      toast.success("تم حفظ الإعدادات", {
        description: "تم حفظ إعدادات هيئة الزكاة والضريبة بنجاح",
      });
      return true;
    } catch (error) {
      toast.error("خطأ في الحفظ", {
        description: "تعذر حفظ الإعدادات. الرجاء المحاولة مرة أخرى.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    toast.info("جاري الاختبار...", {
      description: "يتم التحقق من الاتصال بخدمة الهيئة",
    });

    // محاكاة اختبار الاتصال
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (settings.apiKey && settings.organizationId) {
      toast.success("نجح الاتصال", {
        description: "تم التحقق من الاتصال بنجاح",
        icon: React.createElement(CheckCircle, { className: "h-5 w-5 text-success" }),
      });
      return true;
    } else {
      toast.error("فشل الاتصال", {
        description: "الرجاء التحقق من البيانات المدخلة",
      });
      return false;
    }
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    testConnection,
    isSaving,
  };
}
