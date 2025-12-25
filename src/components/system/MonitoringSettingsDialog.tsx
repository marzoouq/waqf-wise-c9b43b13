import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

interface MonitoringSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonitoringSettingsDialog({
  open,
  onOpenChange,
}: MonitoringSettingsDialogProps) {
  const [settings, setSettings] = useState({
    autoRefreshInterval: "30",
    enableAutoFix: true,
    maxRetries: "3",
    alertThreshold: "critical",
    enableSlackNotifications: false,
    enableEmailNotifications: true,
    retentionDays: "30",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage for now
      localStorage.setItem("monitoring_settings", JSON.stringify(settings));
      toast.success("تم حفظ إعدادات المراقبة");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving monitoring settings:", error);
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات المراقبة
          </DialogTitle>
          <DialogDescription>
            تكوين إعدادات نظام المراقبة والتنبيهات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Auto Refresh */}
          <div className="space-y-2">
            <Label>فترة التحديث التلقائي (ثواني)</Label>
            <Input
              type="number"
              value={settings.autoRefreshInterval}
              onChange={(e) =>
                setSettings({ ...settings, autoRefreshInterval: e.target.value })
              }
              min={5}
              max={300}
            />
          </div>

          {/* Auto Fix */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>الإصلاح التلقائي</Label>
              <p className="text-sm text-muted-foreground">
                محاولة إصلاح الأخطاء تلقائياً
              </p>
            </div>
            <Switch
              checked={settings.enableAutoFix}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAutoFix: checked })
              }
            />
          </div>

          {/* Max Retries */}
          <div className="space-y-2">
            <Label>الحد الأقصى لمحاولات الإصلاح</Label>
            <Input
              type="number"
              value={settings.maxRetries}
              onChange={(e) => setSettings({ ...settings, maxRetries: e.target.value })}
              min={1}
              max={10}
            />
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <Label>عتبة التنبيهات</Label>
            <Select
              value={settings.alertThreshold}
              onValueChange={(value) =>
                setSettings({ ...settings, alertThreshold: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفض (جميع التنبيهات)</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="critical">حرج فقط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <Label>قنوات الإشعارات</Label>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>إشعارات البريد الإلكتروني</span>
              <Switch
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableEmailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>إشعارات Slack</span>
              <Switch
                checked={settings.enableSlackNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableSlackNotifications: checked })
                }
              />
            </div>
          </div>

          {/* Retention */}
          <div className="space-y-2">
            <Label>فترة الاحتفاظ بالسجلات (يوم)</Label>
            <Input
              type="number"
              value={settings.retentionDays}
              onChange={(e) =>
                setSettings({ ...settings, retentionDays: e.target.value })
              }
              min={7}
              max={365}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 ms-2" />
            {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
