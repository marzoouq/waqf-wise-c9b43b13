/**
 * ManualTasksCard Component
 * بطاقة تشغيل المهام اليدوية للناظر
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  FileText, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { EdgeFunctionService } from "@/services/edge-function.service";

interface TaskStatus {
  running: boolean;
  success?: boolean;
  error?: string;
  lastRun?: Date;
}

export function ManualTasksCard() {
  const [dailyNotifications, setDailyNotifications] = useState<TaskStatus>({ running: false });
  const [weeklyReport, setWeeklyReport] = useState<TaskStatus>({ running: false });
  const [smartAlerts, setSmartAlerts] = useState<TaskStatus>({ running: false });

  const handleRunDailyNotifications = async () => {
    setDailyNotifications({ running: true });
    try {
      const result = await EdgeFunctionService.invoke('daily-notifications', {});
      if (result.success) {
        setDailyNotifications({ running: false, success: true, lastRun: new Date() });
        toast.success("تم تشغيل نظام الإشعارات اليومية بنجاح");
      } else {
        throw new Error(result.error || "فشل في التشغيل");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
      setDailyNotifications({ running: false, success: false, error: errorMsg });
      toast.error(`فشل في تشغيل الإشعارات: ${errorMsg}`);
    }
  };

  const handleRunWeeklyReport = async () => {
    setWeeklyReport({ running: true });
    try {
      const result = await EdgeFunctionService.invoke('weekly-report', {});
      if (result.success) {
        setWeeklyReport({ running: false, success: true, lastRun: new Date() });
        toast.success("تم إنشاء التقرير الأسبوعي بنجاح");
      } else {
        throw new Error(result.error || "فشل في التشغيل");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
      setWeeklyReport({ running: false, success: false, error: errorMsg });
      toast.error(`فشل في إنشاء التقرير: ${errorMsg}`);
    }
  };

  const handleRunSmartAlerts = async () => {
    setSmartAlerts({ running: true });
    try {
      const result = await EdgeFunctionService.invoke('generate-smart-alerts', {});
      if (result.success) {
        setSmartAlerts({ running: false, success: true, lastRun: new Date() });
        toast.success("تم توليد التنبيهات الذكية بنجاح");
      } else {
        throw new Error(result.error || "فشل في التشغيل");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "خطأ غير معروف";
      setSmartAlerts({ running: false, success: false, error: errorMsg });
      toast.error(`فشل في توليد التنبيهات: ${errorMsg}`);
    }
  };

  const renderStatus = (status: TaskStatus) => {
    if (status.running) {
      return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />قيد التشغيل</Badge>;
    }
    if (status.success === true) {
      return <Badge variant="default" className="gap-1 bg-status-success"><CheckCircle2 className="h-3 w-3" />نجح</Badge>;
    }
    if (status.success === false) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />فشل</Badge>;
    }
    return <Badge variant="outline">لم يُشغّل</Badge>;
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          تشغيل المهام يدوياً
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* الإشعارات اليومية */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">الإشعارات اليومية</p>
              <p className="text-xs text-muted-foreground">فواتير، أقساط، عقود منتهية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStatus(dailyNotifications)}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunDailyNotifications}
              disabled={dailyNotifications.running}
            >
              {dailyNotifications.running ? <Loader2 className="h-4 w-4 animate-spin" /> : "تشغيل"}
            </Button>
          </div>
        </div>

        {/* التقرير الأسبوعي */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/50">
              <FileText className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">التقرير الأسبوعي</p>
              <p className="text-xs text-muted-foreground">ملخص أسبوعي للإدارة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStatus(weeklyReport)}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunWeeklyReport}
              disabled={weeklyReport.running}
            >
              {weeklyReport.running ? <Loader2 className="h-4 w-4 animate-spin" /> : "تشغيل"}
            </Button>
          </div>
        </div>

        {/* التنبيهات الذكية */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-status-warning/20">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            </div>
            <div>
              <p className="font-medium text-sm">التنبيهات الذكية</p>
              <p className="text-xs text-muted-foreground">تحليل البيانات وتوليد تنبيهات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStatus(smartAlerts)}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunSmartAlerts}
              disabled={smartAlerts.running}
            >
              {smartAlerts.running ? <Loader2 className="h-4 w-4 animate-spin" /> : "تشغيل"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          هذه المهام تعمل تلقائياً بشكل دوري، يمكنك تشغيلها يدوياً عند الحاجة
        </p>
      </CardContent>
    </Card>
  );
}
