/**
 * لوحة مراقبة صحة النظام الحية
 * 🔧 جزء من Phase 1: معالجة التنبيهات الحرجة
 */

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
import { useSystemHealthLive } from "@/hooks/system/useSystemHealthLive";
import { useSystemHealthActions } from "@/hooks/system/useSystemHealthActions";
import { ErrorState } from "@/components/shared/ErrorState";

export function SystemHealthDashboard() {
  const { data: liveStats, isLoading, error, refetch } = useSystemHealthLive();
  
  // استخدام hook مخصص للعمليات
  const { handleBulkResolve, handleCleanupResolved, handleManualCleanup } = useSystemHealthActions(refetch);

  // جلب إحصائيات Deduplication من Error Tracker
  const dedupStats = errorTracker.getDeduplicationStats();

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

  if (error) {
    return <ErrorState title="خطأ في تحميل حالة النظام" message={(error as Error).message} onRetry={refetch} />;
  }

  const healthScore = liveStats?.healthScore || 0;

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