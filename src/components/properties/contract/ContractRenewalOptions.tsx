import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ContractFormData } from "./useContractForm";

interface Props {
  formData: ContractFormData;
  onUpdate: (updates: Partial<ContractFormData>) => void;
}

export function ContractRenewalOptions({ formData, onUpdate }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            checked={formData.is_renewable}
            onCheckedChange={(checked) => onUpdate({ is_renewable: checked })}
          />
          <Label>قابل للتجديد</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            checked={formData.auto_renew}
            onCheckedChange={(checked) => onUpdate({ auto_renew: checked })}
          />
          <Label>تجديد تلقائي</Label>
        </div>

        <div className="space-y-2">
          <Label>أيام التنبيه</Label>
          <Input
            type="number"
            value={formData.renewal_notice_days}
            onChange={(e) => onUpdate({ renewal_notice_days: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>الشروط والأحكام</Label>
        <Textarea
          value={formData.terms_and_conditions}
          onChange={(e) => onUpdate({ terms_and_conditions: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>ملاحظات</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={2}
        />
      </div>
    </>
  );
}
