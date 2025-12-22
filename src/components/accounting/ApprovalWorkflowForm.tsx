import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/types/roles";
import type { ApprovalWorkflow, ApprovalLevel } from "@/hooks/requests/useApprovalWorkflows";

const ENTITY_TYPES = [
  { value: 'journal_entry', label: 'قيد محاسبي' },
  { value: 'distribution', label: 'توزيع غلة' },
  { value: 'payment', label: 'دفع مستحقات' },
  { value: 'loan', label: 'قرض' },
  { value: 'request', label: 'طلب' },
  { value: 'contract', label: 'عقد' },
];

const AVAILABLE_ROLES = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface ApprovalWorkflowFormProps {
  onSubmit: (data: Omit<ApprovalWorkflow, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ApprovalWorkflowForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ApprovalWorkflowFormProps) {
  const [formData, setFormData] = useState({
    workflow_name: '',
    entity_type: '',
    is_active: true,
    min_amount: '',
    max_amount: '',
  });

  const [levels, setLevels] = useState<ApprovalLevel[]>([
    { level: 1, role: 'accountant', required: true },
  ]);

  const addLevel = () => {
    setLevels([
      ...levels,
      { level: levels.length + 1, role: 'nazer', required: true },
    ]);
  };

  const removeLevel = (index: number) => {
    if (levels.length > 1) {
      const newLevels = levels.filter((_, i) => i !== index);
      setLevels(newLevels.map((l, i) => ({ ...l, level: i + 1 })));
    }
  };

  const updateLevel = (index: number, field: keyof ApprovalLevel, value: unknown) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setLevels(newLevels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const conditions = {
      ...(formData.min_amount ? { min_amount: parseFloat(formData.min_amount) } : {}),
      ...(formData.max_amount ? { max_amount: parseFloat(formData.max_amount) } : {}),
    };

    await onSubmit({
      workflow_name: formData.workflow_name,
      entity_type: formData.entity_type,
      approval_levels: levels,
      conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
      is_active: formData.is_active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workflow_name">اسم المسار *</Label>
        <Input
          id="workflow_name"
          value={formData.workflow_name}
          onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })}
          placeholder="مثال: مسار موافقة المصروفات"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entity_type">نوع العملية *</Label>
          <Select
            value={formData.entity_type}
            onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العملية" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex items-end">
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">مسار نشط</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_amount">الحد الأدنى للمبلغ (ريال)</Label>
          <Input
            id="min_amount"
            type="number"
            value={formData.min_amount}
            onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
            placeholder="اختياري"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_amount">الحد الأقصى للمبلغ (ريال)</Label>
          <Input
            id="max_amount"
            type="number"
            value={formData.max_amount}
            onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
            placeholder="اختياري"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>مستويات الموافقة *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLevel}>
            <Plus className="h-4 w-4 ms-1" />
            إضافة مستوى
          </Button>
        </div>

        <div className="space-y-2">
          {levels.map((level, index) => (
            <div key={`level-${level.level}`} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium min-w-[80px]">
                المستوى {level.level}
              </span>
              
              <Select
                value={level.role}
                onValueChange={(value) => updateLevel(index, 'role', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Switch
                  checked={level.required}
                  onCheckedChange={(checked) => updateLevel(index, 'required', checked)}
                />
                <span className="text-xs text-muted-foreground">مطلوب</span>
              </div>

              {levels.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLevel(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.workflow_name || !formData.entity_type}
        >
          {isSubmitting ? 'جاري الحفظ...' : 'إنشاء المسار'}
        </Button>
      </div>
    </form>
  );
}
