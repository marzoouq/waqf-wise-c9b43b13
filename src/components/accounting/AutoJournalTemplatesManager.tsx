import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Zap, Settings } from 'lucide-react';
import { useAutoJournalTemplates } from '@/hooks/useAutoJournalTemplates';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AutoJournalTemplateDialog } from './AutoJournalTemplateDialog';

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
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الحدث المُشغل</TableHead>
                  <TableHead>اسم القالب</TableHead>
                  <TableHead>الحسابات المدينة</TableHead>
                  <TableHead>الحسابات الدائنة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      لا توجد قوالب
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {triggerEventLabels[template.trigger_event] || template.trigger_event}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{template.template_name}</TableCell>
                      <TableCell>
                        {template.debit_accounts.map((acc: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="mr-1">
                            {acc.account_code}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {template.credit_accounts.map((acc: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="mr-1">
                            {acc.account_code}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>{template.priority}</TableCell>
                      <TableCell>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => handleToggle(template.id, template.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
