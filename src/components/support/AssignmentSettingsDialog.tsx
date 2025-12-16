import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignmentSettings } from '@/hooks/support/useAgentAvailability';

interface AssignmentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignmentSettingsDialog({
  open,
  onOpenChange,
}: AssignmentSettingsDialogProps) {
  const { settings, updateSettings } = useAssignmentSettings();
  const [assignmentType, setAssignmentType] = useState('load_balanced');
  const [autoAssign, setAutoAssign] = useState(true);
  const [maxTickets, setMaxTickets] = useState(10);

  useEffect(() => {
    if (settings) {
      setAssignmentType(settings.assignment_type || 'load_balanced');
      setAutoAssign(settings.auto_assign ?? true);
      setMaxTickets(settings.max_tickets_per_agent || 10);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      assignment_type: assignmentType,
      auto_assign: autoAssign,
      max_tickets_per_agent: maxTickets,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إعدادات التعيين التلقائي</DialogTitle>
          <DialogDescription>
            إدارة كيفية توزيع التذاكر على فريق الدعم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-assign">تفعيل التعيين التلقائي</Label>
              <p className="text-sm text-muted-foreground">
                توزيع التذاكر الجديدة تلقائياً
              </p>
            </div>
            <Switch
              id="auto-assign"
              checked={autoAssign}
              onCheckedChange={setAutoAssign}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-type">نوع التعيين</Label>
            <Select value={assignmentType} onValueChange={setAssignmentType}>
              <SelectTrigger id="assignment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">
                  <div>
                    <p className="font-medium">التعيين بالتناوب</p>
                    <p className="text-xs text-muted-foreground">
                      توزيع متساوي بين الموظفين
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="load_balanced">
                  <div>
                    <p className="font-medium">التعيين المتوازن</p>
                    <p className="text-xs text-muted-foreground">
                      بناءً على الحمل الحالي للموظف
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="skill_based">
                  <div>
                    <p className="font-medium">التعيين بالمهارات</p>
                    <p className="text-xs text-muted-foreground">
                      بناءً على تخصص الموظف
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-tickets">الحد الأقصى للتذاكر لكل موظف</Label>
            <Input
              id="max-tickets"
              type="number"
              min="1"
              max="50"
              value={maxTickets}
              onChange={(e) => setMaxTickets(parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              عدد التذاكر النشطة التي يمكن تعيينها لموظف واحد
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
