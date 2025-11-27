import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import type { ApprovalSettingsValues, ApprovalWorkflowType } from '@/types/distribution/index';

interface ApprovalSettingsProps {
  values: ApprovalSettingsValues;
  onChange: (values: ApprovalSettingsValues) => void;
}

export function ApprovalSettings({ values, onChange }: ApprovalSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>مسار الموافقة</Label>
        <RadioGroup
          value={values.workflow}
          onValueChange={(workflow) => onChange({ ...values, workflow: workflow as ApprovalWorkflowType })}
        >
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="standard" id="standard" />
              <div className="flex-1">
                <Label htmlFor="standard" className="cursor-pointer font-medium">
                  مسار قياسي
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  محاسب → ناظر → تنفيذ (3 مستويات)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="fast" id="fast" />
              <div className="flex-1">
                <Label htmlFor="fast" className="cursor-pointer font-medium">
                  مسار سريع
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  ناظر → تنفيذ (مستويان فقط)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="extended" id="extended" />
              <div className="flex-1">
                <Label htmlFor="extended" className="cursor-pointer font-medium">
                  مسار موسع
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  مراجع → محاسب → ناظر → مدير مالي → تنفيذ (5 مستويات)
                </p>
              </div>
            </div>
          </Card>
        </RadioGroup>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-notify">إشعارات تلقائية</Label>
            <p className="text-sm text-muted-foreground">
              إرسال إشعارات للموافقين تلقائياً عند كل خطوة
            </p>
          </div>
          <Switch
            id="auto-notify"
            checked={values.autoNotify}
            onCheckedChange={(autoNotify) => onChange({ ...values, autoNotify })}
          />
        </div>
      </Card>

      <div className="p-4 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
        سيتم إرسال إشعار لكل شخص في سلسلة الموافقات عند وصول الدور إليه
      </div>
    </div>
  );
}
