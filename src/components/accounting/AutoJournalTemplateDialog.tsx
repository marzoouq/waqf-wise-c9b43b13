import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { productionLogger } from '@/lib/logger/production-logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutoJournalTemplates } from '@/hooks/useAutoJournalTemplates';
import { Plus, Trash2 } from 'lucide-react';
import type { AutoJournalTemplate, AccountMapping } from '@/types/auto-journal';

const triggerEvents = [
  { value: 'payment_made', label: 'دفع مستحقات مستفيد' },
  { value: 'rental_received', label: 'استلام إيجار عقار' },
  { value: 'distribution_approved', label: 'توزيع غلة الوقف' },
  { value: 'loan_disbursed', label: 'صرف قرض' },
  { value: 'loan_payment', label: 'سداد قسط قرض' },
  { value: 'maintenance_paid', label: 'دفع صيانة' },
  { value: 'nazer_fee_deducted', label: 'استقطاع نسبة الناظر' },
  { value: 'reserve_allocated', label: 'تخصيص احتياطي' },
  { value: 'investment_return', label: 'عائد استثمار' },
  { value: 'bank_charges', label: 'رسوم بنكية' },
  { value: 'salary_paid', label: 'صرف راتب موظف' },
  { value: 'property_purchased', label: 'شراء عقار' },
  { value: 'donation_received', label: 'استلام تبرع' },
  { value: 'tax_paid', label: 'دفع ضريبة' },
  { value: 'custom_transaction', label: 'معاملة مخصصة' },
];

interface FormData {
  trigger_event: string;
  template_name: string;
  description: string;
  priority: number;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AutoJournalTemplate;
}

export function AutoJournalTemplateDialog({ open, onOpenChange, template }: Props) {
  const { createTemplate, updateTemplate } = useAutoJournalTemplates();
  const [formData, setFormData] = useState<FormData>({
    trigger_event: '',
    template_name: '',
    description: '',
    priority: 100,
    debit_accounts: [{ account_code: '', percentage: 100 }],
    credit_accounts: [{ account_code: '', percentage: 100 }],
  });

  useEffect(() => {
    if (template) {
      setFormData({
        trigger_event: template.trigger_event,
        template_name: template.template_name,
        description: template.description || '',
        priority: template.priority,
        debit_accounts: template.debit_accounts,
        credit_accounts: template.credit_accounts,
      });
    } else {
      setFormData({
        trigger_event: '',
        template_name: '',
        description: '',
        priority: 100,
        debit_accounts: [{ account_code: '', percentage: 100 }],
        credit_accounts: [{ account_code: '', percentage: 100 }],
      });
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (template) {
        await updateTemplate({ id: template.id, ...formData });
      } else {
        await createTemplate(formData);
      }
      onOpenChange(false);
    } catch (error) {
      productionLogger.error('Error saving template', error);
    }
  };

  const addDebitAccount = () => {
    setFormData({
      ...formData,
      debit_accounts: [...formData.debit_accounts, { account_code: '', percentage: 0 }],
    });
  };

  const removeDebitAccount = (index: number) => {
    setFormData({
      ...formData,
      debit_accounts: formData.debit_accounts.filter((_, i) => i !== index),
    });
  };

  const addCreditAccount = () => {
    setFormData({
      ...formData,
      credit_accounts: [...formData.credit_accounts, { account_code: '', percentage: 0 }],
    });
  };

  const removeCreditAccount = (index: number) => {
    setFormData({
      ...formData,
      credit_accounts: formData.credit_accounts.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'تعديل قالب قيد تلقائي' : 'قالب قيد تلقائي جديد'}
          </DialogTitle>
          <DialogDescription>
            حدد الحدث المُشغل والحسابات المحاسبية
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>الحدث المُشغل *</Label>
          <Select
            value={formData.trigger_event}
            onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
            disabled={!!template}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحدث" />
            </SelectTrigger>
            <SelectContent>
              {triggerEvents.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>اسم القالب *</Label>
          <Input
            value={formData.template_name}
            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
            placeholder="مثال: قيد دفع مستحقات"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>الوصف</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="وصف مختصر للقالب"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>الأولوية</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            min="1"
            max="1000"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>الحسابات المدينة *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addDebitAccount}>
              <Plus className="h-4 w-4 ms-1" />
              إضافة
            </Button>
          </div>
          {formData.debit_accounts.map((acc, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="رمز الحساب"
                value={acc.account_code}
                onChange={(e) => {
                  const newAccounts = [...formData.debit_accounts];
                  newAccounts[idx].account_code = e.target.value;
                  setFormData({ ...formData, debit_accounts: newAccounts });
                }}
                required
              />
              <Input
                type="number"
                placeholder="النسبة %"
                value={acc.percentage}
                onChange={(e) => {
                  const newAccounts = [...formData.debit_accounts];
                  newAccounts[idx].percentage = parseInt(e.target.value);
                  setFormData({ ...formData, debit_accounts: newAccounts });
                }}
                className="w-28"
              />
              {formData.debit_accounts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDebitAccount(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>الحسابات الدائنة *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCreditAccount}>
              <Plus className="h-4 w-4 ms-1" />
              إضافة
            </Button>
          </div>
          {formData.credit_accounts.map((acc, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="رمز الحساب"
                value={acc.account_code}
                onChange={(e) => {
                  const newAccounts = [...formData.credit_accounts];
                  newAccounts[idx].account_code = e.target.value;
                  setFormData({ ...formData, credit_accounts: newAccounts });
                }}
                required
              />
              <Input
                type="number"
                placeholder="النسبة %"
                value={acc.percentage}
                onChange={(e) => {
                  const newAccounts = [...formData.credit_accounts];
                  newAccounts[idx].percentage = parseInt(e.target.value);
                  setFormData({ ...formData, credit_accounts: newAccounts });
                }}
                className="w-28"
              />
              {formData.credit_accounts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCreditAccount(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit">
            {template ? 'تحديث' : 'إنشاء'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
