import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';

interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  frequency: string;
  next_run: string;
  is_active: boolean;
  recipients: string[];
  created_at: string;
}

export function ScheduledReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    report_type: 'beneficiaries',
    frequency: 'daily',
    recipients: '',
  });

  // جلب التقارير المجدولة
  const { data: scheduledReports = [], isLoading } = useQuery<ScheduledReport[]>({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ScheduledReport[];
    },
  });

  // إنشاء تقرير مجدول
  const createScheduledReport = useMutation({
    mutationFn: async (schedule: typeof newSchedule) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const nextRun = new Date();
      if (schedule.frequency === 'daily') {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (schedule.frequency === 'weekly') {
        nextRun.setDate(nextRun.getDate() + 7);
      } else if (schedule.frequency === 'monthly') {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }

      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert({
          name: schedule.name,
          report_type: schedule.report_type,
          frequency: schedule.frequency,
          next_run: nextRun.toISOString(),
          is_active: true,
          recipients: schedule.recipients.split(',').map(r => r.trim()),
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      setIsDialogOpen(false);
      setNewSchedule({
        name: '',
        report_type: 'beneficiaries',
        frequency: 'daily',
        recipients: '',
      });
      toast({
        title: 'تم الحفظ',
        description: 'تم إضافة التقرير المجدول بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة التقرير المجدول',
        variant: 'destructive',
      });
    },
  });

  // حذف تقرير مجدول
  const deleteScheduledReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف التقرير المجدول بنجاح',
      });
    },
  });

  // تفعيل/تعطيل تقرير
  const toggleReportStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.recipients) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    createScheduledReport.mutate(newSchedule);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل التقارير المجدولة..." />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          التقارير المجدولة
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة تقرير مجدول
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة تقرير مجدول</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم التقرير</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="مثال: تقرير المستفيدين الشهري"
                />
              </div>

              <div className="space-y-2">
                <Label>نوع التقرير</Label>
                <Select
                  value={newSchedule.report_type}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, report_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beneficiaries">تقرير المستفيدين</SelectItem>
                    <SelectItem value="properties">تقرير العقارات</SelectItem>
                    <SelectItem value="payments">تقرير المدفوعات</SelectItem>
                    <SelectItem value="distributions">تقرير التوزيعات</SelectItem>
                    <SelectItem value="financial">تقرير مالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>التكرار</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>المستلمون (البريد الإلكتروني، مفصولة بفواصل)</Label>
                <Input
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateSchedule}>
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم التقرير</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التكرار</TableHead>
              <TableHead>التشغيل التالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  لا توجد تقارير مجدولة
                </TableCell>
              </TableRow>
            ) : (
              scheduledReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.report_type}</TableCell>
                  <TableCell>{report.frequency}</TableCell>
                  <TableCell>
                    {new Date(report.next_run).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.is_active ? 'default' : 'secondary'}>
                      {report.is_active ? 'نشط' : 'متوقف'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toggleReportStatus.mutate({
                            id: report.id,
                            isActive: report.is_active,
                          })
                        }
                      >
                        {report.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteScheduledReport.mutate(report.id)}
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
      </CardContent>
    </Card>
  );
}
