/**
 * لوحة مراقبة صحة النظام الحية
 * 🔧 جزء من Phase 1: معالجة التنبيهات الحرجة
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  RefreshCw,
  Trash2
} from "lucide-react";
import { errorTracker } from "@/lib/errors/tracker";
import { toast } from "sonner";

export function SystemHealthDashboard() {
  // جلب إحصائيات حية من قاعدة البيانات
  const { data: liveStats, isLoading, refetch } = useQuery({
    queryKey: ["system-health-live"],
    queryFn: async () => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [errorsResult, alertsResult, fixesResult] = await Promise.all([
        supabase
          .from("system_error_logs")
          .select("id, severity, status, created_at", { count: "exact" })
          .gte("created_at", last7d),
        supabase
          .from("system_alerts")
          .select("id, severity, status, created_at", { count: "exact" })
          .gte("created_at", last7d),
        supabase
          .from("auto_fix_attempts")
          .select("id, status, created_at", { count: "exact" })
          .gte("created_at", last24h),
      ]);

      const errors = errorsResult.data || [];
      const alerts = alertsResult.data || [];
      const fixes = fixesResult.data || [];

      return {
        // الأخطاء
        totalErrors: errorsResult.count || 0,
        newErrors: errors.filter(e => e.status === "new").length,
        criticalErrors: errors.filter(e => e.severity === "critical" && e.status === "new").length,
        highErrors: errors.filter(e => e.severity === "high" && e.status === "new").length,
        resolvedErrors: errors.filter(e => e.status === "resolved" || e.status === "auto_resolved").length,
        
        // التنبيهات
        totalAlerts: alertsResult.count || 0,
        activeAlerts: alerts.filter(a => a.status === "active").length,
        criticalAlerts: alerts.filter(a => a.severity === "critical" && a.status === "active").length,
        highAlerts: alerts.filter(a => a.severity === "high" && a.status === "active").length,
        
        // الإصلاح التلقائي
        totalFixes: fixesResult.count || 0,
        successfulFixes: fixes.filter(f => f.status === "success").length,
        failedFixes: fixes.filter(f => f.status === "failed").length,
        
        // معدلات النجاح
        errorResolutionRate: errors.length > 0 
          ? Math.round((errors.filter(e => e.status === "resolved" || e.status === "auto_resolved").length / errors.length) * 100)
          : 100,
        fixSuccessRate: fixes.length > 0
          ? Math.round((fixes.filter(f => f.status === "success").length / fixes.length) * 100)
          : 100,
      };
    },
    refetchInterval: 10000, // تحديث كل 10 ثواني
  });

  // جلب إحصائيات Deduplication من Error Tracker
  const dedupStats = errorTracker.getDeduplicationStats();

  // حل جميع التنبيهات القديمة
  const handleBulkResolve = async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from("system_alerts")
        .update({ 
          status: "resolved", 
          resolved_at: new Date().toISOString() 
        })
        .eq("status", "active")
        .lt("created_at", oneDayAgo);

      if (error) throw error;

      toast.success("تم حل جميع التنبيهات القديمة بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل في حل التنبيهات");
      console.error(error);
    }
  };

  // مسح الأخطاء المحلولة القديمة
  const handleCleanupResolved = async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from("system_error_logs")
        .delete()
        .in("status", ["resolved", "auto_resolved"])
        .lt("resolved_at", oneWeekAgo);

      if (error) throw error;

      toast.success("تم مسح الأخطاء القديمة بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل في مسح الأخطاء");
      console.error(error);
    }
  };

  // 🔧 تنظيف فوري يدوي - تشغيل Cron Job
  const handleManualCleanup = async () => {
    try {
      toast.info("جاري تنفيذ التنظيف الفوري...");
      
      const { data, error } = await supabase.functions.invoke('execute-auto-fix', {
        body: { manual: true }
      });

      if (error) throw error;

      toast.success(`تم التنظيف بنجاح! تم إصلاح ${data?.fixed || 0} مشكلة`);
      refetch();
    } catch (error) {
      toast.error("فشل التنظيف الفوري");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthScore = liveStats 
    ? Math.round((liveStats.errorResolutionRate + liveStats.fixSuccessRate) / 2)
    : 0;

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            لوحة المراقبة الحية
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            <Button 
              size="sm" 
              variant="default"
              onClick={handleManualCleanup}
            >
              <Zap className="h-4 w-4 ml-2" />
              تنظيف فوري
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleBulkResolve}
            >
              <CheckCircle2 className="h-4 w-4 ml-2" />
              حل القديمة
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleCleanupResolved}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              مسح المحلولة
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* مؤشر الصحة العام */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">صحة النظام العامة</span>
            <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}%
            </span>
          </div>
          <Progress value={healthScore} className="h-3" />
        </div>

        {/* إحصائيات التنبيهات الحرجة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">تنبيهات حرجة</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-destructive">
                {liveStats?.criticalAlerts || 0}
              </span>
              <Badge variant="destructive">نشط</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">تنبيهات عالية</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-warning">
                {liveStats?.highAlerts || 0}
              </span>
              <Badge variant="secondary">نشط</Badge>
            </div>
          </div>
        </div>

        {/* إحصائيات الأخطاء */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">الأخطاء (آخر 7 أيام)</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">الإجمالي</span>
              <p className="text-2xl font-bold">{liveStats?.totalErrors || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">جديدة</span>
              <p className="text-2xl font-bold text-warning">{liveStats?.newErrors || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">محلولة</span>
              <p className="text-2xl font-bold text-success">{liveStats?.resolvedErrors || 0}</p>
            </div>
          </div>
        </div>

        {/* معدل الحل التلقائي */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">معدل الإصلاح التلقائي</span>
            <span className="text-lg font-bold text-info">
              {liveStats?.fixSuccessRate || 0}%
            </span>
          </div>
          <Progress value={liveStats?.fixSuccessRate || 0} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>ناجح: {liveStats?.successfulFixes || 0}</span>
            <span>فاشل: {liveStats?.failedFixes || 0}</span>
          </div>
        </div>

        {/* Deduplication Stats */}
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            إحصائيات Deduplication
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">إجمالي</span>
              <p className="text-xl font-bold">{dedupStats.total}</p>
            </div>
            <div>
              <span className="text-muted-foreground">نشط</span>
              <p className="text-xl font-bold text-info">{dedupStats.active}</p>
            </div>
            <div>
              <span className="text-muted-foreground">محلول</span>
              <p className="text-xl font-bold text-success">{dedupStats.resolved}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}