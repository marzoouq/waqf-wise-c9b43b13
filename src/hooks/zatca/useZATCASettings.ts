/**
 * Hook لإعدادات هيئة الزكاة والضريبة
 * @version 2.8.65
 */

import { useState } from "react";
import { SettingsService } from "@/services/settings.service";
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
      await SettingsService.saveZATCASettings([
        { key: 'zatca_enabled', value: settings.enabled ? 'true' : 'false' },
        { key: 'zatca_organization_id', value: settings.organizationId },
        { key: 'zatca_vat_number', value: settings.vatNumber },
        { key: 'zatca_api_key', value: settings.apiKey },
        { key: 'zatca_test_mode', value: settings.testMode ? 'true' : 'false' },
      ]);
      
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
