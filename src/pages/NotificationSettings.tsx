import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings as NotificationSettingsType } from "@/types/notifications";

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
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
      return data as NotificationSettingsType | null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<NotificationSettingsType>) => {
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

  const handleToggle = (field: keyof NotificationSettingsType, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  if (isLoading) {
    return <div className="container-custom py-6">جاري التحميل...</div>;
  }

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="إعدادات الإشعارات"
        description="تخصيص طريقة استلام الإشعارات والتنبيهات"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* قنوات الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle>قنوات الإشعارات</CardTitle>
            <CardDescription>اختر كيف تريد استلام الإشعارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Switch
                id="email"
                checked={settings?.email_enabled ?? true}
                onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms">الرسائل القصيرة (SMS)</Label>
              <Switch
                id="sms"
                checked={settings?.sms_enabled ?? false}
                onCheckedChange={(checked) => handleToggle('sms_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push">إشعارات الدفع (Push)</Label>
              <Switch
                id="push"
                checked={settings?.push_enabled ?? true}
                onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="in_app">داخل التطبيق</Label>
              <Switch
                id="in_app"
                checked={settings?.in_app_enabled ?? true}
                onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* أنواع الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle>أنواع الإشعارات</CardTitle>
            <CardDescription>اختر أنواع الإشعارات التي تريد استلامها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="distribution">إشعارات التوزيعات</Label>
              <Switch
                id="distribution"
                checked={settings?.distribution_notifications ?? true}
                onCheckedChange={(checked) => handleToggle('distribution_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requests">إشعارات الطلبات</Label>
              <Switch
                id="requests"
                checked={settings?.request_notifications ?? true}
                onCheckedChange={(checked) => handleToggle('request_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="payments">إشعارات المدفوعات</Label>
              <Switch
                id="payments"
                checked={settings?.payment_notifications ?? true}
                onCheckedChange={(checked) => handleToggle('payment_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="loans">إشعارات القروض</Label>
              <Switch
                id="loans"
                checked={settings?.loan_notifications ?? true}
                onCheckedChange={(checked) => handleToggle('loan_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system">إشعارات النظام</Label>
              <Switch
                id="system"
                checked={settings?.system_notifications ?? true}
                onCheckedChange={(checked) => handleToggle('system_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
