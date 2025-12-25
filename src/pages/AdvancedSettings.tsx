import { useState } from 'react';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PushNotificationsSetup } from '@/components/settings/PushNotificationsSetup';
import { ScheduledReportsManager } from '@/components/reports/ScheduledReportsManager';
import { RestoreBackupDialog } from '@/components/settings/RestoreBackupDialog';
import { BackupSettingsDialog } from '@/components/settings/BackupSettingsDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBackup } from '@/hooks/system/useBackup';
import { useSecurityStats } from '@/hooks/system/useSecurityStats';
import { formatRelative } from '@/lib/date';
import {
  Bell,
  Calendar,
  Database,
  Shield,
  Settings,
  Download,
  Upload,
  Loader2,
} from 'lucide-react';

export default function AdvancedSettings() {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const {
    backupLogs,
    backupSchedules,
    createBackup,
    restoreBackup,
    isCreatingBackup,
    isRestoring,
    refetch,
  } = useBackup();

  const {
    failedLogins,
    sensitiveOperations,
    twoFaUsers,
    totalUsers,
  } = useSecurityStats();

  // Get active schedules count
  const activeSchedulesCount = backupSchedules?.filter((s) => s.is_active).length || 0;

  // Get last successful backup
  const lastSuccessfulBackup = backupLogs?.find((log) => log.status === 'completed');
  const lastBackupDate = lastSuccessfulBackup?.completed_at
    ? formatRelative(lastSuccessfulBackup.completed_at)
    : 'لا يوجد';
  const lastBackupSize = lastSuccessfulBackup?.file_size
    ? `${(lastSuccessfulBackup.file_size / (1024 * 1024)).toFixed(1)} MB`
    : 'غير معروف';

  // Get next scheduled backup
  const nextSchedule = backupSchedules?.find((s) => s.is_active && s.next_backup_at);
  const nextBackupDate = nextSchedule?.next_backup_at
    ? formatRelative(nextSchedule.next_backup_at)
    : 'غير مجدول';

  const handleRestore = (data: string, mode: 'merge' | 'replace') => {
    restoreBackup({ backupData: JSON.parse(data), mode });
    setRestoreDialogOpen(false);
  };

  return (
    <PageErrorBoundary pageName="الإعدادات المتقدمة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الإعدادات المتقدمة"
          description="إعدادات النظام المتقدمة والمميزات الإضافية"
          icon={<Settings className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        <Tabs defaultValue="notifications" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full min-w-max md:grid md:grid-cols-4 h-auto p-1">
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm min-h-[44px]">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">الإشعارات</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 text-xs sm:text-sm min-h-[44px]">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">التقارير المجدولة</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2 text-xs sm:text-sm min-h-[44px]">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">النسخ الاحتياطي</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm min-h-[44px]">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">الأمان</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationsSetup />

            <Card>
              <CardHeader>
                <CardTitle>قنوات الإشعارات</CardTitle>
                <CardDescription>
                  إدارة طرق استقبال الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">إشعارات داخل التطبيق</h4>
                          <p className="text-sm text-muted-foreground">
                            إشعارات مباشرة في واجهة المستخدم
                          </p>
                        </div>
                        <Badge variant="default">مفعّل</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">البريد الإلكتروني</h4>
                          <p className="text-sm text-muted-foreground">
                            إرسال إشعارات عبر البريد الإلكتروني
                          </p>
                        </div>
                        <Badge variant="secondary">قريباً</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">الرسائل النصية (SMS)</h4>
                          <p className="text-sm text-muted-foreground">
                            إرسال تنبيهات عبر الرسائل النصية
                          </p>
                        </div>
                        <Badge variant="secondary">قريباً</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">إشعارات فورية (Push)</h4>
                          <p className="text-sm text-muted-foreground">
                            تنبيهات فورية على الأجهزة
                          </p>
                        </div>
                        <Badge variant="default">مفعّل</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ScheduledReportsManager />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نظام النسخ الاحتياطي التلقائي</CardTitle>
                <CardDescription>
                  جدولة وإدارة النسخ الاحتياطية للبيانات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">النسخ النشطة</span>
                          <Badge>{activeSchedulesCount}</Badge>
                        </div>
                        <p className="text-2xl font-bold">{activeSchedulesCount} جدولة</p>
                        <p className="text-xs text-muted-foreground">
                          من إجمالي {backupSchedules?.length || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">آخر نسخة</span>
                          <Badge variant={lastSuccessfulBackup ? "default" : "secondary"}>
                            {lastSuccessfulBackup ? "نجح" : "لا يوجد"}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold">{lastBackupDate}</p>
                        <p className="text-xs text-muted-foreground">
                          حجم: {lastBackupSize}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">النسخة القادمة</span>
                          <Badge variant="secondary">مجدولة</Badge>
                        </div>
                        <p className="text-sm font-bold">{nextBackupDate}</p>
                        <p className="text-xs text-muted-foreground">
                          {nextSchedule?.backup_type || "نسخة كاملة"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">الجداول المجدولة</h4>
                  
                  {backupSchedules?.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h5 className="font-medium">{schedule.schedule_name}</h5>
                            <p className="text-sm text-muted-foreground">
                              نوع: {schedule.backup_type} - التكرار: {schedule.frequency}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{schedule.frequency}</Badge>
                              <Badge variant="outline">{schedule.retention_days} يوم احتفاظ</Badge>
                            </div>
                          </div>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!backupSchedules || backupSchedules.length === 0) && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">لا توجد جداول نسخ احتياطي</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => createBackup("full")} disabled={isCreatingBackup}>
                    {isCreatingBackup ? (
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 ms-2" />
                    )}
                    {isCreatingBackup ? "جاري الإنشاء..." : "تنزيل نسخة احتياطية"}
                  </Button>
                  <Button variant="outline" onClick={() => setRestoreDialogOpen(true)}>
                    <Upload className="h-4 w-4 ms-2" />
                    استعادة من نسخة
                  </Button>
                  <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
                    <Settings className="h-4 w-4 ms-2" />
                    إعدادات النسخ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأمان والحماية</CardTitle>
                <CardDescription>
                  إعدادات الأمان المتقدمة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">المصادقة الثنائية (2FA)</h4>
                      <p className="text-sm text-muted-foreground">
                        طبقة أمان إضافية لتسجيل الدخول
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">حماية كلمات المرور المسربة</h4>
                      <p className="text-sm text-muted-foreground">
                        منع استخدام كلمات مرور مسربة سابقاً
                      </p>
                    </div>
                    <Badge variant="secondary">يُنصح بالتفعيل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">تسجيل العمليات (Audit Logs)</h4>
                      <p className="text-sm text-muted-foreground">
                        تسجيل جميع العمليات الحساسة
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">أمان على مستوى الصفوف (RLS)</h4>
                      <p className="text-sm text-muted-foreground">
                        سياسات أمان لجميع الجداول
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">تشفير البيانات</h4>
                      <p className="text-sm text-muted-foreground">
                        تشفير البيانات الحساسة أثناء التخزين والنقل
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">إحصائيات الأمان (آخر 30 يوم)</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">محاولات تسجيل فاشلة</p>
                      <p className="text-2xl font-bold">{failedLogins.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">عمليات حساسة مسجلة</p>
                      <p className="text-2xl font-bold">{sensitiveOperations.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">مستخدمون بـ 2FA</p>
                      <p className="text-2xl font-bold">{twoFaUsers}/{totalUsers}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RestoreBackupDialog
          open={restoreDialogOpen}
          onOpenChange={setRestoreDialogOpen}
          onRestore={handleRestore}
          isRestoring={isRestoring}
        />

        <BackupSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          schedules={backupSchedules || []}
          onUpdate={refetch}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
