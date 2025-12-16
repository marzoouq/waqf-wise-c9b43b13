import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings as NotificationSettingsType } from "@/types/notifications";
import { MultiChannelNotifications } from "@/components/notifications/MultiChannelNotifications";
import { Settings, Radio } from "lucide-react";
import { useNotificationSettingsData } from "@/hooks/notifications/useNotificationSettingsData";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export default function NotificationSettings() {
  const { settings, isLoading, error, handleToggle } = useNotificationSettingsData();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإعدادات..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الإعدادات" 
        message="حدث خطأ أثناء تحميل إعدادات الإشعارات"
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="إعدادات الإشعارات"
        description="تخصيص طريقة استلام الإشعارات والتنبيهات"
      />

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="channels" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
            <Radio className="h-4 w-4" />
            <span>قنوات الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
            <Settings className="h-4 w-4" />
            <span>التفضيلات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-6">
          <MultiChannelNotifications />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* قنوات الإشعارات */}
            <Card>
              <CardHeader>
                <CardTitle>تفعيل القنوات</CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
