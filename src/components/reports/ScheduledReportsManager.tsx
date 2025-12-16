import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useScheduledReports,
  useCreateScheduledReport,
  useUpdateScheduledReport,
  useDeleteScheduledReport,
  useTriggerScheduledReport,
} from '@/hooks/reports/useScheduledReports';
import { useCustomReports } from '@/hooks/useCustomReports';
import { Calendar, Clock, Mail, Play, Trash2, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ScheduledReport = Database['public']['Tables']['scheduled_report_jobs']['Row'];
type ReportTemplate = Database['public']['Tables']['custom_report_templates']['Row'];
import { LoadingState } from '@/components/shared/LoadingState';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function ScheduledReportsManager() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recipients, setRecipients] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'storage' | 'both'>('email');
  const [isActive, setIsActive] = useState(true);

  const { data: scheduledReports, isLoading } = useScheduledReports();
  const { templates } = useCustomReports();
  const createReport = useCreateScheduledReport();
  const updateReport = useUpdateScheduledReport();
  const deleteReport = useDeleteScheduledReport();
  const triggerReport = useTriggerScheduledReport();

  const handleCreate = async () => {
    if (!selectedTemplate || !recipients) return;

    const recipientList = recipients.split(',').map(email => ({
      email: email.trim(),
      user_id: '', // سيتم تحديده لاحقاً
    }));

    await createReport.mutateAsync({
      report_template_id: selectedTemplate,
      schedule_type: scheduleType,
      recipients: recipientList,
      delivery_method: deliveryMethod,
      is_active: isActive,
    });

    setCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplate('');
    setScheduleType('daily');
    setRecipients('');
    setDeliveryMethod('email');
    setIsActive(true);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل التقارير المجدولة..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التقارير المجدولة</h2>
          <p className="text-muted-foreground">
            إدارة التقارير التي يتم إنشاؤها تلقائياً
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 ms-2" />
          جدولة تقرير جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {scheduledReports && scheduledReports.length > 0 ? (
          scheduledReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {report.report_template?.name || 'تقرير مجدول'}
                    </CardTitle>
                    <CardDescription>
                      {report.report_template?.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.is_active ? (
                      <Badge variant="default">نشط</Badge>
                    ) : (
                      <Badge variant="secondary">متوقف</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>التكرار: {report.schedule_type === 'daily' ? 'يومي' : report.schedule_type === 'weekly' ? 'أسبوعي' : 'شهري'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>المستلمون: {report.recipients?.length || 0}</span>
                  </div>
                  {report.last_run_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>آخر تشغيل: {format(new Date(report.last_run_at), 'PPp', { locale: ar })}</span>
                    </div>
                  )}
                  {report.next_run_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>التشغيل القادم: {format(new Date(report.next_run_at), 'PPp', { locale: ar })}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => triggerReport.mutate(report.id)}
                  >
                    <Play className="h-4 w-4 ml-2" />
                    تشغيل الآن
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateReport.mutate({
                      id: report.id,
                      report: { is_active: !report.is_active }
                    })}
                  >
                    {report.is_active ? 'إيقاف' : 'تفعيل'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteReport.mutate(report.id)}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">لا توجد تقارير مجدولة</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جدولة تقرير جديد</DialogTitle>
            <DialogDescription>
              اختر قالب التقرير وحدد جدول التنفيذ والمستلمين
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>قالب التقرير</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر قالب التقرير" />
                </SelectTrigger>
                <SelectContent>
                  {(templates as ReportTemplate[])?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>التكرار</Label>
              <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as 'daily' | 'weekly' | 'monthly')}>
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
              <Label>البريد الإلكتروني للمستلمين (مفصولة بفاصلة)</Label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>طريقة التسليم</Label>
              <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as 'email' | 'storage' | 'both')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">بريد إلكتروني</SelectItem>
                  <SelectItem value="storage">تخزين في الأرشيف</SelectItem>
                  <SelectItem value="both">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>تفعيل فوراً</Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreate} disabled={createReport.isPending}>
                جدولة التقرير
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}