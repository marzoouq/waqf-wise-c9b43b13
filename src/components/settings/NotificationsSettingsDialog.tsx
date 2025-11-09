import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationsSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsSettingsDialog({
  open,
  onOpenChange,
}: NotificationsSettingsDialogProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    approvalAlerts: true,
    paymentAlerts: true,
    journalEntryAlerts: true,
    distributionAlerts: true,
    systemAlerts: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "تم تحديث الإعدادات",
      description: "تم حفظ تفضيلات الإشعارات بنجاح",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="notifications-description">
        <DialogHeader>
          <DialogTitle className="text-xl">إعدادات الإشعارات</DialogTitle>
          <DialogDescription id="notifications-description">
            تخصيص تفضيلات التنبيهات والإشعارات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* قنوات الإشعارات */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold mb-4">قنوات الإشعارات</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام الإشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push">الإشعارات الفورية</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام الإشعارات الفورية على الجهاز
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleToggle("pushNotifications")}
                />
              </div>
            </CardContent>
          </Card>

          {/* أنواع الإشعارات */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold mb-4">أنواع الإشعارات</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="approvals">تنبيهات الموافقات</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند طلبات الموافقة الجديدة
                  </p>
                </div>
                <Switch
                  id="approvals"
                  checked={settings.approvalAlerts}
                  onCheckedChange={() => handleToggle("approvalAlerts")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payments">تنبيهات المدفوعات</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند إضافة أو تعديل مدفوعات
                  </p>
                </div>
                <Switch
                  id="payments"
                  checked={settings.paymentAlerts}
                  onCheckedChange={() => handleToggle("paymentAlerts")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="journal">تنبيهات القيود اليومية</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند إضافة قيود محاسبية جديدة
                  </p>
                </div>
                <Switch
                  id="journal"
                  checked={settings.journalEntryAlerts}
                  onCheckedChange={() => handleToggle("journalEntryAlerts")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="distributions">تنبيهات التوزيعات</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند جدولة أو تنفيذ التوزيعات
                  </p>
                </div>
                <Switch
                  id="distributions"
                  checked={settings.distributionAlerts}
                  onCheckedChange={() => handleToggle("distributionAlerts")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system">تنبيهات النظام</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات مهمة حول النظام والتحديثات
                  </p>
                </div>
                <Switch
                  id="system"
                  checked={settings.systemAlerts}
                  onCheckedChange={() => handleToggle("systemAlerts")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
