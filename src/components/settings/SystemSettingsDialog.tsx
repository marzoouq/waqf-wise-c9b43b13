import { useState, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Settings, DollarSign, Bell, Shield, Globe, Save, RotateCcw } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { useToast } from "@/hooks/use-toast";

interface SystemSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemSettingsDialog({ open, onOpenChange }: SystemSettingsDialogProps) {
  const { settings, isLoading, updateSetting, getSetting } = useSystemSettings();
  const { toast } = useToast();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.length > 0 && Object.keys(editedSettings).length === 0) {
      const initial: Record<string, string> = {};
      settings.forEach(s => {
        initial[s.setting_key] = s.setting_value;
      });
      setEditedSettings(initial);
    }
  }, [settings]);

  const validateSettings = () => {
    const errors: string[] = [];
    
    const threshold = Number(editedSettings['payment_approval_threshold']);
    if (threshold && (threshold < 0 || threshold > 1000000)) {
      errors.push("حد الموافقة على المدفوعات يجب أن يكون بين 0 و 1,000,000");
    }

    const passLength = Number(editedSettings['password_min_length']);
    if (passLength && (passLength < 6 || passLength > 20)) {
      errors.push("الحد الأدنى لطول كلمة المرور يجب أن يكون بين 6 و 20");
    }

    const sessionTimeout = Number(editedSettings['session_timeout_minutes']);
    if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 1440)) {
      errors.push("مهلة الجلسة يجب أن تكون بين 5 و 1440 دقيقة");
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateSettings();
    if (errors.length > 0) {
      toast({
        title: "خطأ في التحقق",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const promises = Object.entries(editedSettings).map(([key, value]) => {
        const originalValue = getSetting(key);
        if (value !== originalValue) {
          return updateSetting({ key, value });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const initial: Record<string, string> = {};
    settings.forEach(s => {
      initial[s.setting_key] = s.setting_value;
    });
    setEditedSettings(initial);
    toast({
      title: "تم الاستعادة",
      description: "تم استعادة القيم الأصلية",
    });
  };

  const updateValue = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const renderSetting = (setting: Database['public']['Tables']['system_settings']['Row']) => {
    const value = editedSettings[setting.setting_key] || setting.setting_value;
    const hasChanged = value !== setting.setting_value;

    if (setting.setting_type === 'boolean') {
      return (
        <div key={setting.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${hasChanged ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
          <div className="flex-1">
            <Label htmlFor={setting.setting_key} className="text-base font-medium">
              {setting.description}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              المفتاح: {setting.setting_key}
            </p>
          </div>
          <Switch
            id={setting.setting_key}
            checked={value === 'true'}
            onCheckedChange={(checked) => updateValue(setting.setting_key, checked ? 'true' : 'false')}
          />
        </div>
      );
    }

    return (
      <div key={setting.id} className={`p-4 rounded-lg space-y-2 transition-colors ${hasChanged ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
        <Label htmlFor={setting.setting_key} className="text-base font-medium">
          {setting.description}
        </Label>
        <p className="text-sm text-muted-foreground">
          المفتاح: {setting.setting_key}
        </p>
        <Input
          id={setting.setting_key}
          type={setting.setting_type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => updateValue(setting.setting_key, e.target.value)}
          className="mt-2"
        />
        {hasChanged && (
          <p className="text-xs text-primary mt-1">
            القيمة الأصلية: {setting.setting_value}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <ResponsiveDialog 
        open={open} 
        onOpenChange={onOpenChange}
        title="إعدادات النظام"
        size="xl"
      >
        <LoadingState message="جاري تحميل الإعدادات..." />
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إعدادات النظام"
      description="إدارة جميع إعدادات النظام والتفضيلات"
      size="xl"
    >
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            المالية
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            عامة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات المالية</CardTitle>
              <CardDescription>
                إدارة الإعدادات المالية والمحاسبية للنظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('financial').map(renderSetting)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                التحكم في إشعارات النظام والتنبيهات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('notifications').map(renderSetting)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>
                إدارة إعدادات الأمان والخصوصية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('security').map(renderSetting)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>
                إعدادات النظام العامة والتفضيلات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory('general').map(renderSetting)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={handleReset} disabled={isSaving}>
          <RotateCcw className="h-4 w-4 ml-2" />
          استعادة
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 ml-2" />
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
