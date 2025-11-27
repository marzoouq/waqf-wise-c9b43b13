import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Zap, Settings } from 'lucide-react';
import { useAutoJournalTemplates } from '@/hooks/useAutoJournalTemplates';
import { AutoJournalTemplateDialog } from './AutoJournalTemplateDialog';
import { UnifiedDataTable, type Column } from '@/components/unified/UnifiedDataTable';
import type { AutoJournalTemplate as DialogTemplate } from '@/types/auto-journal';

interface AccountEntry {
  account_code: string;
  account_id?: string;
  percentage?: number;
  fixed_amount?: number;
}

interface Template {
  id: string;
  template_name: string;
  trigger_event: string;
  debit_accounts: AccountEntry[];
  credit_accounts: AccountEntry[];
  is_active: boolean;
  priority?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

const triggerEventLabels: Record<string, string> = {
  payment_made: 'دفع مستحقات مستفيد',
  rental_received: 'استلام إيجار عقار',
  distribution_approved: 'توزيع غلة الوقف',
  loan_disbursed: 'صرف قرض',
  loan_payment: 'سداد قسط قرض',
  maintenance_paid: 'دفع صيانة',
  nazer_fee_deducted: 'استقطاع نسبة الناظر',
  reserve_allocated: 'تخصيص احتياطي',
  investment_return: 'عائد استثمار',
  bank_charges: 'رسوم بنكية',
  salary_paid: 'صرف راتب موظف',
  property_purchased: 'شراء عقار',
  donation_received: 'استلام تبرع',
  tax_paid: 'دفع ضريبة',
  custom_transaction: 'معاملة مخصصة',
};

export function AutoJournalTemplatesManager() {
  const { templates, isLoading, toggleActive, deleteTemplate } = useAutoJournalTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DialogTemplate | null>(null);

  const handleEdit = (template: Template) => {
    setEditingTemplate(template as unknown as DialogTemplate);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      await deleteTemplate(id);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await toggleActive({ id, is_active: !isActive });
  };

  const typedTemplates = templates as unknown as Template[];

  const columns: Column<Template>[] = [
    {
      key: "trigger_event",
      label: "الحدث المُشغل",
      render: (_, template) => (
        <Badge variant="outline" className="text-xs">
          {triggerEventLabels[template.trigger_event] || template.trigger_event}
        </Badge>
      ),
    },
    {
      key: "template_name",
      label: "اسم القالب",
      render: (_, template) => (
        <span className="font-medium text-xs sm:text-sm">{template.template_name}</span>
      ),
    },
    {
      key: "debit_accounts",
      label: "الحسابات المدينة",
      render: (_, template) => (
        <div className="flex flex-wrap gap-1">
          {(template.debit_accounts as AccountEntry[]).map((acc, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {acc.account_code}
            </Badge>
          ))}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "credit_accounts",
      label: "الحسابات الدائنة",
      render: (_, template) => (
        <div className="flex flex-wrap gap-1">
          {(template.credit_accounts as AccountEntry[]).map((acc, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {acc.account_code}
            </Badge>
          ))}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "priority",
      label: "الأولوية",
      render: (_, template) => (
        <span className="text-xs sm:text-sm">{template.priority}</span>
      ),
    },
    {
      key: "is_active",
      label: "الحالة",
      render: (_, template) => (
        <Switch
          checked={template.is_active}
          onCheckedChange={() => handleToggle(template.id, template.is_active)}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                قوالب القيود التلقائية
              </CardTitle>
              <CardDescription>
                إدارة قوالب القيود المحاسبية التي يتم إنشاؤها تلقائياً عند حدوث عمليات محددة
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 ml-2" />
              قالب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={typedTemplates}
            loading={isLoading}
            emptyMessage="لا توجد قوالب"
            actions={(template) => (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong>ملاحظة:</strong> القيود التلقائية يتم إنشاؤها عند حدوث الأحداث المحددة في النظام.
                يمكنك تخصيص الحسابات المدينة والدائنة لكل حدث، وتحديد النسب المئوية أو المبالغ الثابتة.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AutoJournalTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
      />
    </>
  );
}
