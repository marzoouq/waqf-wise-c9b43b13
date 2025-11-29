import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Zap,
  Shield,
  Bell,
  RefreshCw,
} from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { SystemError, SystemAlert } from "@/types/monitoring";
import { AdminAlertsPanel } from "@/components/system/AdminAlertsPanel";
import { SelfHealingToolsPanel } from "@/components/system/SelfHealingToolsPanel";
import { SystemHealthDashboard } from "@/components/system/SystemHealthDashboard";
import { useSystemMonitoring } from "@/hooks/useSystemMonitoring";

export default function SystemMonitoring() {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    stats,
    recentErrors,
    activeAlerts,
    fixAttempts,
    statsLoading,
    healthPercentage,
    fixSuccessRate,
    resolveAlert,
    isResolvingAlert,
    refreshAllData,
  } = useSystemMonitoring();

  if (statsLoading) return <LoadingState message="جاري تحميل بيانات المراقبة..." />;

  return (
    <PageErrorBoundary pageName="مراقبة النظام">
      <div className="container mx-auto p-6 space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              مراقبة النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              نظام متكامل لكشف وإصلاح الأخطاء تلقائياً
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshAllData}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأخطاء</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.unresolvedErrors} غير محلولة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أخطاء حرجة</CardTitle>
              <Zap className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats?.criticalErrors}
              </div>
              <p className="text-xs text-muted-foreground">تتطلب تدخل فوري</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صحة النظام</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{healthPercentage}%</div>
              <p className="text-xs text-muted-foreground">من الفحوصات ناجحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإصلاح التلقائي</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{fixSuccessRate}%</div>
              <p className="text-xs text-muted-foreground">معدل النجاح</p>
            </CardContent>
          </Card>
        </div>

        {/* لوحة الصحة الحية */}
        <SystemHealthDashboard />

        {/* لوحة تنبيهات المسؤولين */}
        <AdminAlertsPanel />

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="alerts">
              التنبيهات
              {stats?.activeAlerts && stats.activeAlerts > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {stats.activeAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="errors">الأخطاء</TabsTrigger>
            <TabsTrigger value="fixes">الإصلاح التلقائي</TabsTrigger>
            <TabsTrigger value="tools">أدوات التحكم</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الأخطاء الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                {!recentErrors || recentErrors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد أخطاء مسجلة
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentErrors.map((error: SystemError) => (
                      <div
                        key={error.id}
                        className="flex items-start justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                error.severity === "critical"
                                  ? "destructive"
                                  : error.severity === "high"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {error.severity}
                            </Badge>
                            <span className="text-sm font-medium">{error.error_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {error.error_message.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(error.created_at), {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </p>
                        </div>
                        <Badge variant="outline">{error.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* التنبيهات النشطة */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  التنبيهات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!activeAlerts || activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد تنبيهات نشطة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map((alert: SystemAlert) => (
                      <div
                        key={alert.id}
                        className="flex items-start justify-between p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">{alert.severity}</Badge>
                            <span className="font-semibold">{alert.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          {alert.occurrence_count > 1 && (
                            <Badge variant="outline">
                              تكرر {alert.occurrence_count} مرة
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                          disabled={isResolvingAlert}
                        >
                          حل التنبيه
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* سجل الأخطاء */}
          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>سجل الأخطاء الكامل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  راجع صفحة{" "}
                  <a href="/system-errors" className="text-primary underline">
                    سجل الأخطاء
                  </a>{" "}
                  للتفاصيل الكاملة
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* محاولات الإصلاح */}
          <TabsContent value="fixes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-info" />
                  محاولات الإصلاح التلقائي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!fixAttempts || fixAttempts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد محاولات إصلاح مسجلة
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fixAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{attempt.fix_strategy}</Badge>
                            <span className="text-sm">
                              محاولة {attempt.attempt_number} من {attempt.max_attempts}
                            </span>
                          </div>
                          {attempt.result && (
                            <p className="text-sm text-muted-foreground">{attempt.result}</p>
                          )}
                        </div>
                        <Badge
                          variant={
                            attempt.status === "success"
                              ? "default"
                              : attempt.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {attempt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* أدوات التحكم المتقدمة */}
          <TabsContent value="tools" className="space-y-4">
            <SelfHealingToolsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageErrorBoundary>
  );
}
