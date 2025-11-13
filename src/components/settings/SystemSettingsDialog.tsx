import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    
    // Validate payment threshold
    const threshold = Number(editedSettings['payment_approval_threshold']);
    if (threshold && (threshold < 0 || threshold > 1000000)) {
      errors.push("حد الموافقة على المدفوعات يجب أن يكون بين 0 و 1,000,000");
    }

    // Validate password length
    const passLength = Number(editedSettings['password_min_length']);
    if (passLength && (passLength < 6 || passLength > 20)) {
      errors.push("الحد الأدنى لطول كلمة المرور يجب أن يكون بين 6 و 20");
    }

    // Validate session timeout
    const sessionTimeout = Number(editedSettings['session_timeout_minutes']);
    if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 1440)) {
      errors.push("مهلة الجلسة يجب أن تكون بين 5 و 1440 دقيقة");
    }

    return errors;
  };

  const handleSave = async () => {
    // Validation
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
      // حفظ التغييرات
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
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
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

  const renderSetting = (setting: any) => {
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <LoadingState message="جاري تحميل الإعدادات..." />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="h-6 w-6" />
            إعدادات النظام
          </DialogTitle>
          <DialogDescription>
            إدارة الإعدادات العامة والمتقدمة للنظام
          </DialogDescription>
        </DialogHeader>

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

          {/* المالية */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات المالية</CardTitle>
                <CardDescription>
                  إدارة الحدود المالية وإعدادات الموافقات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('financial').map(renderSetting)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الإشعارات */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>
                  التحكم في أنواع الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('notifications').map(renderSetting)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الأمان */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>
                  سياسات كلمات المرور والجلسات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('security').map(renderSetting)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* عامة */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>
                  العملة، المنطقة الزمنية، والإعدادات الأخرى
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('general').map(renderSetting)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* أزرار الحفظ والاستعادة */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            استعادة القيم الأصلية
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
