import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Download, Database, Activity } from "lucide-react";
import { toast } from "sonner";
import { selfHealing } from "@/lib/selfHealing";

export function ToolsPanel() {
  const handleClearCache = () => {
    selfHealing.cache.clear();
    toast.success("تم مسح الذاكرة المؤقتة");
  };

  const handleReconnectDB = async () => {
    toast.info("جاري إعادة الاتصال بقاعدة البيانات...");
    const success = await selfHealing.autoRecovery.reconnectDatabase();
    if (success) {
      toast.success("تم إعادة الاتصال بنجاح");
    } else {
      toast.error("فشل إعادة الاتصال");
    }
  };

  const handleSyncData = async () => {
    toast.info("جاري مزامنة البيانات المعلقة...");
    await selfHealing.autoRecovery.syncPendingData();
    toast.success("تمت المزامنة بنجاح");
  };

  const handleHealthCheck = async () => {
    toast.info("جاري فحص صحة النظام...");
    
    const dbHealth = await selfHealing.autoRecovery.reconnectDatabase();
    
    let storageHealth = true;
    try {
      localStorage.setItem('health_test', 'ok');
      localStorage.removeItem('health_test');
    } catch {
      storageHealth = false;
    }
    
    const networkHealth = navigator.onLine;
    
    if (dbHealth && storageHealth && networkHealth) {
      toast.success("✅ النظام سليم - جميع الخدمات تعمل بشكل طبيعي");
    } else {
      const issues = [];
      if (!dbHealth) issues.push("قاعدة البيانات");
      if (!storageHealth) issues.push("التخزين المحلي");
      if (!networkHealth) issues.push("الشبكة");
      toast.error(`⚠️ يوجد مشاكل في: ${issues.join(", ")}`);
    }
  };

  const handleExportLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      storage: {
        local: localStorage.length,
        session: sessionStorage.length,
      }
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("تم تصدير السجلات");
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleClearCache}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            مسح الذاكرة المؤقتة
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleReconnectDB}
          >
            <Database className="w-4 h-4 ml-2" />
            إعادة الاتصال بقاعدة البيانات
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSyncData}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            مزامنة البيانات المعلقة
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleHealthCheck}
          >
            <Activity className="w-4 h-4 ml-2" />
            فحص صحة النظام
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportLogs}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير السجلات
          </Button>
        </CardContent>
      </Card>

      {/* Console Commands */}
      <Card>
        <CardHeader>
          <CardTitle>أوامر Console المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-muted/50">
              <code className="text-sm">window.waqfDebug.healthStatus()</code>
              <p className="text-xs text-muted-foreground mt-1">
                عرض حالة صحة النظام
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-muted/50">
              <code className="text-sm">window.waqfDebug.clearCache()</code>
              <p className="text-xs text-muted-foreground mt-1">
                مسح الذاكرة المؤقتة
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-muted/50">
              <code className="text-sm">window.waqfDebug.reconnectDB()</code>
              <p className="text-xs text-muted-foreground mt-1">
                إعادة الاتصال بقاعدة البيانات
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-muted/50">
              <code className="text-sm">window.waqfDebug.syncPending()</code>
              <p className="text-xs text-muted-foreground mt-1">
                مزامنة البيانات المعلقة
              </p>
            </div>

            <div className="border rounded-lg p-3 bg-muted/50">
              <code className="text-sm">toggleQueryDevtools()</code>
              <p className="text-xs text-muted-foreground mt-1">
                عرض/إخفاء React Query DevTools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User Agent:</dt>
              <dd className="font-mono text-xs">{navigator.userAgent.substring(0, 50)}...</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Online:</dt>
              <dd>{navigator.onLine ? "✅ متصل" : "❌ غير متصل"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Language:</dt>
              <dd>{navigator.language}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Platform:</dt>
              <dd>{navigator.platform}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
