import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AutoJournalTemplate, AutoJournalTemplateInsert } from "@/hooks/accounting/useAutoJournalTemplates";

const TRIGGER_EVENTS = [
  { value: 'payment_received', label: 'استلام دفعة' },
  { value: 'invoice_created', label: 'إنشاء فاتورة' },
  { value: 'distribution_approved', label: 'اعتماد توزيع' },
  { value: 'loan_disbursed', label: 'صرف قرض' },
  { value: 'loan_repayment', label: 'سداد قرض' },
  { value: 'expense_approved', label: 'اعتماد مصروف' },
  { value: 'contract_signed', label: 'توقيع عقد' },
];

interface AutoJournalTemplateFormProps {
  template?: AutoJournalTemplate | null;
  onSubmit: (data: AutoJournalTemplateInsert) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AutoJournalTemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AutoJournalTemplateFormProps) {
  const [formData, setFormData] = useState({
    template_name: '',
    description: '',
    trigger_event: '',
    priority: 1,
    is_active: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name,
        description: template.description || '',
        trigger_event: template.trigger_event,
        priority: template.priority || 1,
        is_active: template.is_active ?? true,
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      debit_accounts: [],
      credit_accounts: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template_name">اسم القالب *</Label>
        <Input
          id="template_name"
          value={formData.template_name}
          onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
          placeholder="مثال: قيد استلام إيجار"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="وصف مختصر للقالب..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trigger_event">الحدث المحفز *</Label>
          <Select
            value={formData.trigger_event}
            onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحدث" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_EVENTS.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min={1}
            max={10}
            value={formData.priority || 1}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <p className="text-sm text-muted-foreground">
          ملاحظة: تعيين الحسابات المدينة والدائنة يتم من خلال إعدادات الحسابات المحاسبية.
          القالب سيستخدم الحسابات الافتراضية للحدث المحدد.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.template_name || !formData.trigger_event}>
          {isSubmitting ? 'جاري الحفظ...' : template ? 'تحديث' : 'إنشاء'}
        </Button>
      </div>
    </form>
  );
}
