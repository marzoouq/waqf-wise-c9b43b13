import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface BackupSchedule {
  id: string;
  schedule_name: string;
  frequency: string;
  backup_type: string;
  is_active: boolean | null;
  retention_days: number | null;
  include_storage: boolean | null;
}

interface BackupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedules: BackupSchedule[];
  onUpdate: () => void;
}

export function BackupSettingsDialog({
  open,
  onOpenChange,
  schedules,
  onUpdate,
}: BackupSettingsDialogProps) {
  const [localSchedules, setLocalSchedules] = useState<BackupSchedule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && schedules) {
      setLocalSchedules([...schedules]);
    }
  }, [open, schedules]);

  const updateSchedule = (id: string, field: keyof BackupSchedule, value: unknown) => {
    setLocalSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const schedule of localSchedules) {
        const { error } = await supabase
          .from("backup_schedules")
          .update({
            is_active: schedule.is_active,
            frequency: schedule.frequency,
            retention_days: schedule.retention_days,
            include_storage: schedule.include_storage,
          })
          .eq("id", schedule.id);

        if (error) throw error;
      }
      toast.success("تم حفظ إعدادات النسخ الاحتياطي");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving backup settings:", error);
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
            إعدادات النسخ الاحتياطي
          </DialogTitle>
          <DialogDescription>
            تكوين جداول النسخ الاحتياطي التلقائي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {localSchedules.map((schedule) => (
            <div key={schedule.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{schedule.schedule_name}</h4>
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={(checked) =>
                    updateSchedule(schedule.id, "is_active", checked)
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>التكرار</Label>
                  <Select
                    value={schedule.frequency}
                    onValueChange={(value) =>
                      updateSchedule(schedule.id, "frequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>أيام الاحتفاظ</Label>
                  <Input
                    type="number"
                    value={schedule.retention_days || 30}
                    onChange={(e) =>
                      updateSchedule(schedule.id, "retention_days", parseInt(e.target.value) || 30)
                    }
                    min={1}
                    max={365}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id={`storage-${schedule.id}`}
                  checked={schedule.include_storage || false}
                  onCheckedChange={(checked) =>
                    updateSchedule(schedule.id, "include_storage", checked)
                  }
                />
                <Label htmlFor={`storage-${schedule.id}`} className="cursor-pointer">
                  تضمين ملفات التخزين
                </Label>
              </div>
            </div>
          ))}

          {localSchedules.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              لا توجد جداول نسخ احتياطي مُعرّفة
            </p>
          )}
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
