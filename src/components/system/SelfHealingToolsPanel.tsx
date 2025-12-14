import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  Activity, 
  Wifi, 
  Power,
  PlayCircle,
  PauseCircle,
  AlertCircle
} from "lucide-react";
import { useSelfHealing } from "@/hooks/useSelfHealing";
import { useToast } from "@/hooks/use-toast";
import { selfHealing } from "@/lib/selfHealing";
import { useSelfHealingStats } from "@/hooks/system/useSelfHealingStats";

export function SelfHealingToolsPanel() {
  const { toast } = useToast();
  const { clearCache, reconnectDatabase, syncPendingData } = useSelfHealing();
  const [isHealthMonitorRunning, setIsHealthMonitorRunning] = useState(true);

  // 📊 إحصائيات ديناميكية حقيقية من قاعدة البيانات
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useSelfHealingStats();

  // حالة الأدوات
  const toolsStatus = {
    retryHandler: { 
      name: "نظام إعادة المحاولة",
      status: "active",
      description: "يعيد محاولة العمليات الفاشلة تلقائياً"
    },
    cache: { 
      name: "الذاكرة المؤقتة الذكية",
      status: "active",
      description: "يحفظ البيانات مؤقتاً لتسريع الوصول"
    },
    autoRecovery: { 
      name: "الاسترجاع التلقائي",
      status: "active",
      description: "يسترجع البيانات من Cache عند فشل العمليات"
    },
      healthMonitor: { 
        name: "مراقب الصحة",
        status: isHealthMonitorRunning ? "active" : "stopped",
        description: "يفحص صحة النظام كل دقيقتين"
      },
    circuitBreaker: { 
      name: "قاطع الدائرة",
      status: "standby",
      description: "يمنع تكرار الأخطاء عند فشل متكرر"
    }
  };

  const handleToggleHealthMonitor = () => {
    if (isHealthMonitorRunning) {
      selfHealing.healthMonitor.stop();
      setIsHealthMonitorRunning(false);
      toast({ 
        title: "⏸️ تم إيقاف مراقب الصحة",
        description: "لن يتم فحص صحة النظام تلقائياً"
      });
    } else {
      selfHealing.healthMonitor.start();
      setIsHealthMonitorRunning(true);
      toast({ 
        title: "▶️ تم تشغيل مراقب الصحة",
        description: "سيتم فحص صحة النظام كل دقيقتين"
      });
    }
  };

  const handleComprehensiveCleanup = async () => {
    try {
      // مسح الذاكرة المؤقتة
      clearCache();
      
      // مزامنة البيانات المعلقة
      await syncPendingData();
      
      // مسح سجل الأخطاء المحلي
      localStorage.removeItem('error_logs');
      localStorage.removeItem('pending_operations');
      
      toast({ 
        title: "✅ اكتمل التنظيف الشامل",
        description: "تم مسح جميع البيانات المؤقتة والمعلقة"
      });
    } catch (error) {
      toast({ 
        title: "❌ فشل التنظيف الشامل",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* حالة الأدوات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            حالة أدوات الإصلاح الذاتي
          </CardTitle>
          <CardDescription>
            عرض وإدارة جميع أدوات الإصلاح التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(toolsStatus).map(([key, tool]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{tool.name}</h4>
                  <Badge 
                    variant={
                      tool.status === "active" ? "default" : 
                      tool.status === "stopped" ? "secondary" : 
                      "outline"
                    }
                  >
                    {tool.status === "active" ? "نشط" : 
                     tool.status === "stopped" ? "متوقف" : 
                     "استعداد"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              {key === "healthMonitor" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleHealthMonitor}
                >
                  {isHealthMonitorRunning ? (
                    <>
                      <PauseCircle className="h-4 w-4 ms-1" />
                      إيقاف
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 ms-1" />
                      تشغيل
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* عمليات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            عمليات الإصلاح السريع
          </CardTitle>
          <CardDescription>
            أدوات يدوية لحل المشاكل بسرعة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={clearCache}
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 ms-2" />
              مسح الذاكرة المؤقتة
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                const success = await reconnectDatabase();
                if (success) {
                  toast({ title: "✅ تم إعادة الاتصال بقاعدة البيانات" });
                } else {
                  toast({ 
                    title: "❌ فشل إعادة الاتصال", 
                    variant: "destructive" 
                  });
                }
              }}
              className="w-full justify-start"
            >
              <Wifi className="h-4 w-4 ms-2" />
              إعادة الاتصال بقاعدة البيانات
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await syncPendingData();
                toast({ title: "✅ تمت مزامنة البيانات المعلقة" });
              }}
              className="w-full justify-start"
            >
              <Database className="h-4 w-4 ms-2" />
              مزامنة البيانات المعلقة
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                selfHealing.cache.clear();
                toast({ title: "🔄 تم مسح Cache النظام" });
              }}
              className="w-full justify-start"
            >
              <RefreshCw className="h-4 w-4 ms-2" />
              إعادة تعيين Cache
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={handleComprehensiveCleanup}
            className="w-full"
          >
            <AlertCircle className="h-4 w-4 ms-2" />
            تنظيف شامل للنظام
          </Button>
        </CardContent>
      </Card>

      {/* إحصائيات الأداء */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الأداء</CardTitle>
          <CardDescription>
            مراقبة أداء أدوات الإصلاح الذاتي (بيانات حقيقية)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">معدل نجاح إعادة المحاولة</span>
                  <Badge>{stats?.retrySuccessRate}%</Badge>
                </div>
                <Progress value={stats?.retrySuccessRate || 0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.resolvedErrors} من {stats?.totalErrors} خطأ تم حله
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">صحة النظام العامة</span>
                  <Badge variant={
                    (stats?.systemHealth || 0) >= 95 ? "default" : 
                    (stats?.systemHealth || 0) >= 85 ? "secondary" : 
                    "destructive"
                  }>
                    {stats?.systemHealth}%
                  </Badge>
                </div>
                <Progress value={stats?.systemHealth || 0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeAlerts} تنبيه نشط
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* تعليمات للمطورين */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">💻 أدوات المطورين</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            افتح Console واستخدم الأوامر التالية:
          </p>
          <pre className="text-xs bg-background p-3 rounded border overflow-auto">
{`// عرض الأخطاء
window.waqfDebug.viewErrors()

// مسح الأخطاء
window.waqfDebug.clearErrors()

// تصدير الأخطاء
window.waqfDebug.exportErrors()

// مسح Cache
window.waqfDebug.clearCache()

// إعادة الاتصال
window.waqfDebug.reconnectDB()

// مزامنة البيانات
window.waqfDebug.syncPending()

// حالة الصحة
window.waqfDebug.healthStatus()`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
