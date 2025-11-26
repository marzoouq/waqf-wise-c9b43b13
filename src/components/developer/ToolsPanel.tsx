import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Download, Database, Activity, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { selfHealing } from "@/lib/selfHealing";
import { reportExporter } from "@/lib/developer/reportExporter";
import { useWebVitals } from "@/hooks/developer/useWebVitals";
import { useNetworkMonitor } from "@/hooks/developer/useNetworkMonitor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ToolsPanel() {
  const { vitals } = useWebVitals();
  const { requests } = useNetworkMonitor();
  
  const { data: errors } = useQuery({
    queryKey: ["system-errors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    }
  });

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

  const handleExportWebVitalsJSON = () => {
    reportExporter.exportWebVitals(vitals).json();
    toast.success("تم تصدير Web Vitals (JSON)");
  };

  const handleExportWebVitalsCSV = () => {
    reportExporter.exportWebVitals(vitals).csv();
    toast.success("تم تصدير Web Vitals (CSV)");
  };

  const handleExportNetworkJSON = () => {
    reportExporter.exportNetworkStats(requests).json();
    toast.success("تم تصدير طلبات الشبكة (JSON)");
  };

  const handleExportNetworkCSV = () => {
    reportExporter.exportNetworkStats(requests).csv();
    toast.success("تم تصدير طلبات الشبكة (CSV)");
  };

  const handleExportErrorsJSON = () => {
    if (errors && errors.length > 0) {
      reportExporter.exportErrors(errors).json();
      toast.success("تم تصدير الأخطاء (JSON)");
    } else {
      toast.error("لا توجد أخطاء لتصديرها");
    }
  };

  const handleExportErrorsCSV = () => {
    if (errors && errors.length > 0) {
      reportExporter.exportErrors(errors).csv();
      toast.success("تم تصدير الأخطاء (CSV)");
    } else {
      toast.error("لا توجد أخطاء لتصديرها");
    }
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

        </CardContent>
      </Card>

      {/* Export Reports */}
      <Card>
        <CardHeader>
          <CardTitle>تصدير التقارير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Web Vitals</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportWebVitalsJSON}
              >
                <FileJson className="w-4 h-4 ml-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportWebVitalsCSV}
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                CSV
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm">طلبات الشبكة</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportNetworkJSON}
              >
                <FileJson className="w-4 h-4 ml-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportNetworkCSV}
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                CSV
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm">سجل الأخطاء</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportErrorsJSON}
                disabled={!errors || errors.length === 0}
              >
                <FileJson className="w-4 h-4 ml-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportErrorsCSV}
                disabled={!errors || errors.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                CSV
              </Button>
            </div>
          </div>
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
