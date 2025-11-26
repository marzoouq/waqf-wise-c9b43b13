import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Download, Upload, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBackup } from "@/hooks/useBackup";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";

interface DatabaseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseSettingsDialog({
  open,
  onOpenChange,
}: DatabaseSettingsDialogProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { 
    backupLogs, 
    backupSchedules,
    isLoading,
    createBackup, 
    restoreBackup,
    isCreatingBackup,
    isRestoring 
  } = useBackup();

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await createBackup({});
    } catch (error: any) {
      console.error('Backup error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      toast({
        title: "تم اختيار الملف",
        description: file.name,
      });
    } else {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف JSON صالح",
        variant: "destructive",
      });
    }
  };

  const handleRestoreData = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف النسخة الاحتياطية أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);
      
      await restoreBackup({ 
        backupData, 
        mode: 'replace' 
      });
      
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Restore error:', error);
    }
  };

  if (isLoading) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="إعدادات قاعدة البيانات"
        size="lg"
      >
        <LoadingState message="جاري تحميل معلومات النسخ الاحتياطي..." />
      </ResponsiveDialog>
    );
  }

  const latestBackup = backupLogs?.[0];
  const activeSchedule = backupSchedules?.[0];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إعدادات قاعدة البيانات"
      description="إدارة النسخ الاحتياطي واستعادة البيانات"
      size="lg"
    >
      <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              يتم حفظ النسخ الاحتياطية تلقائياً كل 24 ساعة. يمكنك أيضاً إنشاء نسخة احتياطية يدوية في أي وقت.
            </AlertDescription>
          </Alert>

          {/* النسخ الاحتياطي */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Download className="h-4 w-4" />
                <h3 className="font-semibold">النسخ الاحتياطي</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                تصدير نسخة احتياطية كاملة من قاعدة البيانات
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleExportData}
                  disabled={isExporting || isCreatingBackup}
                  className="w-full"
                >
                  {isExporting || isCreatingBackup ? "جاري التصدير..." : "تصدير نسخة احتياطية الآن"}
                </Button>

                {latestBackup && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium mb-2">آخر نسخة احتياطية:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>التاريخ:</span>
                        <span>{new Date(latestBackup.created_at || '').toLocaleString('ar-SA')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الحالة:</span>
                        <Badge variant={latestBackup.status === 'completed' ? 'default' : 'destructive'}>
                          {latestBackup.status === 'completed' ? (
                            <><CheckCircle2 className="h-3 w-3 ml-1" /> مكتملة</>
                          ) : latestBackup.status === 'in_progress' ? (
                            <><Clock className="h-3 w-3 ml-1" /> جارية</>
                          ) : (
                            <><XCircle className="h-3 w-3 ml-1" /> فاشلة</>
                          )}
                        </Badge>
                      </div>
                      {latestBackup.file_size && (
                        <div className="flex justify-between">
                          <span>الحجم:</span>
                          <span>{(latestBackup.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">البيانات المشمولة:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>الحسابات المحاسبية</li>
                    <li>القيود اليومية</li>
                    <li>المدفوعات والفواتير</li>
                    <li>المستفيدين والتوزيعات</li>
                    <li>المستندات والأرشيف</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* استعادة البيانات */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-4 w-4" />
                <h3 className="font-semibold">استعادة البيانات</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                استيراد نسخة احتياطية سابقة لاستعادة البيانات
              </p>

              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تحذير: استعادة البيانات ستستبدل جميع البيانات الحالية. يُنصح بإنشاء نسخة احتياطية قبل المتابعة.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file-input"
                />
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => document.getElementById('backup-file-input')?.click()}
                >
                  اختيار ملف النسخة الاحتياطية
                </Button>

                {selectedFile && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium">الملف المختار:</p>
                    <p className="text-xs mt-1">{selectedFile.name}</p>
                    <p className="text-xs">الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!selectedFile || isRestoring}
                  onClick={handleRestoreData}
                  variant="destructive"
                >
                  {isRestoring ? "جاري الاستعادة..." : "استعادة البيانات"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">النسخ الاحتياطية التلقائية</h3>
              
              {activeSchedule ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    آخر نسخة احتياطية تلقائية: {activeSchedule.last_backup_at 
                      ? new Date(activeSchedule.last_backup_at).toLocaleString('ar-SA')
                      : 'لم يتم بعد'}
                  </p>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">التكرار:</span>
                      <span className="font-medium">{activeSchedule.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الحالة:</span>
                      <Badge variant={activeSchedule.is_active ? 'default' : 'secondary'}>
                        {activeSchedule.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">النسخة القادمة:</span>
                      <span className="font-medium">
                        {activeSchedule.next_backup_at 
                          ? new Date(activeSchedule.next_backup_at).toLocaleString('ar-SA')
                          : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">مدة الاحتفاظ:</span>
                      <span className="font-medium">{activeSchedule.retention_days || 30} يوم</span>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    لا يوجد جدول نسخ احتياطي تلقائي نشط حالياً
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
    </ResponsiveDialog>
  );
}
