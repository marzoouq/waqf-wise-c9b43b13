/**
 * Developer Dashboard
 * لوحة تحكم المطور الشاملة مع مؤشرات الأمان والمراقبة
 * @version 1.0.0
 */

import { Link } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { LoadingState } from "@/components/shared/LoadingState";
import { useDeveloperDashboardData } from "@/hooks/developer/useDeveloperDashboardData";
import { format, arLocale as ar } from "@/lib/date";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Database,
  Code2,
  Terminal,
  Lock,
  Unlock,
  Bug,
  Zap,
  Eye,
  RefreshCw,
  ExternalLink,
  FileCheck,
  GitBranch,
  TestTube,
} from "lucide-react";

export default function DeveloperDashboard() {
  const { data, isLoading } = useDeveloperDashboardData();

  if (isLoading) {
    return <LoadingState message="جاري تحميل لوحة المطور..." />;
  }

  const { security, systemHealth, codeQuality, recentSecurityEvents, recentErrors } = data;

  // تحديد حالة الأمان الإجمالية
  const getOverallSecurityStatus = () => {
    if (security.criticalIssues > 0) return { status: 'critical', color: 'destructive', icon: ShieldAlert };
    if (security.openSecurityIssues > 5) return { status: 'warning', color: 'default', icon: Shield };
    return { status: 'secure', color: 'secondary', icon: ShieldCheck };
  };

  const securityStatus = getOverallSecurityStatus();

  return (
    <PageErrorBoundary pageName="لوحة المطور">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="لوحة تحكم المطور"
          description="مراقبة شاملة للأمان والأداء وجودة الكود"
          icon={<Terminal className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">تحديث</span>
            </Button>
          }
        />

        {/* الحالة الإجمالية */}
        <div className="mb-6">
          <Card className={`border-2 ${
            securityStatus.status === 'critical' ? 'border-destructive bg-destructive/5' :
            securityStatus.status === 'warning' ? 'border-warning bg-warning/5' :
            'border-success bg-success/5'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <securityStatus.icon className={`h-8 w-8 ${
                    securityStatus.status === 'critical' ? 'text-destructive' :
                    securityStatus.status === 'warning' ? 'text-warning' :
                    'text-success'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {securityStatus.status === 'critical' ? 'تحذير أمني حرج' :
                       securityStatus.status === 'warning' ? 'يوجد تنبيهات أمنية' :
                       'النظام آمن'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {security.criticalIssues > 0 
                        ? `${security.criticalIssues} مشكلة حرجة تتطلب اهتمام فوري`
                        : security.openSecurityIssues > 0
                        ? `${security.openSecurityIssues} مشكلة أمنية مفتوحة`
                        : 'جميع الفحوصات الأمنية ناجحة'}
                    </p>
                  </div>
                </div>
                <Link to="/security">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    التفاصيل
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title={`تغطية RLS (${security.rlsEnabledTables}/${security.totalTables})`}
            value={`${security.rlsCoverage}%`}
            icon={Lock}
            variant={security.rlsCoverage >= 90 ? 'success' : security.rlsCoverage >= 70 ? 'warning' : 'danger'}
          />
          <UnifiedKPICard
            title="صحة النظام"
            value={`${systemHealth.healthPercentage}%`}
            icon={Activity}
            variant={systemHealth.healthPercentage >= 90 ? 'success' : systemHealth.healthPercentage >= 70 ? 'warning' : 'danger'}
          />
          <UnifiedKPICard
            title="الاختبارات"
            value={`${codeQuality.testsPassing}/${codeQuality.testsCount}`}
            icon={TestTube}
            variant={codeQuality.testsPassing === codeQuality.testsCount ? 'success' : 'warning'}
          />
          <UnifiedKPICard
            title="حالة البناء"
            value={codeQuality.buildStatus === 'success' ? 'ناجح' : codeQuality.buildStatus === 'failed' ? 'فشل' : 'قيد التنفيذ'}
            icon={GitBranch}
            variant={codeQuality.buildStatus === 'success' ? 'success' : codeQuality.buildStatus === 'failed' ? 'danger' : 'warning'}
          />
        </UnifiedStatsGrid>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="security" className="mt-6">
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-4 gap-1">
              <TabsTrigger value="security" className="text-xs sm:text-sm px-3 sm:px-4 gap-2">
                <Shield className="h-4 w-4" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm px-3 sm:px-4 gap-2">
                <Activity className="h-4 w-4" />
                صحة النظام
              </TabsTrigger>
              <TabsTrigger value="quality" className="text-xs sm:text-sm px-3 sm:px-4 gap-2">
                <Code2 className="h-4 w-4" />
                جودة الكود
              </TabsTrigger>
              <TabsTrigger value="quick-access" className="text-xs sm:text-sm px-3 sm:px-4 gap-2">
                <Zap className="h-4 w-4" />
                وصول سريع
              </TabsTrigger>
            </TabsList>
          </div>

          {/* تبويب الأمان */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* مقاييس RLS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    تغطية Row Level Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الجداول المحمية</span>
                    <Badge variant={security.rlsCoverage >= 90 ? 'secondary' : 'destructive'}>
                      {security.rlsEnabledTables} / {security.totalTables}
                    </Badge>
                  </div>
                  <Progress value={security.rlsCoverage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-success" />
                      <span className="text-sm">{security.rlsEnabledTables} محمي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-destructive" />
                      <span className="text-sm">{security.totalTables - security.rlsEnabledTables} غير محمي</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* المشاكل الأمنية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    المشاكل الأمنية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span>مشاكل حرجة</span>
                    </div>
                    <Badge variant="destructive">{security.criticalIssues}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <span>مشاكل مفتوحة</span>
                    </div>
                    <Badge variant="default">{security.openSecurityIssues}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-muted-foreground" />
                      <span>نشاط مشبوه</span>
                    </div>
                    <Badge variant="outline">{security.suspiciousActivities}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الأحداث الأمنية الأخيرة */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>الأحداث الأمنية الأخيرة</CardTitle>
                <Link to="/security">
                  <Button variant="ghost" size="sm" className="gap-1">
                    عرض الكل
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentSecurityEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد أحداث أمنية حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentSecurityEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            event.severity === 'critical' ? 'destructive' :
                            event.severity === 'error' ? 'destructive' :
                            event.severity === 'warning' ? 'default' : 'secondary'
                          }>
                            {event.severity}
                          </Badge>
                          <span className="text-sm">{event.description || event.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.resolved ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {event.created_at && format(new Date(event.created_at), 'dd/MM HH:mm', { locale: ar })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب صحة النظام */}
          <TabsContent value="health" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">الأخطاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.totalErrors}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth.unresolvedErrors} غير محلولة
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">أخطاء حرجة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{systemHealth.criticalErrors}</div>
                  <p className="text-xs text-muted-foreground">تتطلب تدخل فوري</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">التنبيهات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{systemHealth.activeAlerts}</div>
                  <p className="text-xs text-muted-foreground">تحتاج مراجعة</p>
                </CardContent>
              </Card>
            </div>

            {/* الأخطاء الأخيرة */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>الأخطاء الأخيرة</CardTitle>
                <Link to="/system-error-logs">
                  <Button variant="ghost" size="sm" className="gap-1">
                    عرض الكل
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentErrors.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد أخطاء مسجلة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentErrors.map((error) => (
                      <div key={error.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              error.severity === 'critical' ? 'destructive' :
                              error.severity === 'high' ? 'destructive' :
                              'secondary'
                            }>
                              {error.severity}
                            </Badge>
                            <span className="text-sm font-medium">{error.error_type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {error.error_message}
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

          {/* تبويب جودة الكود */}
          <TabsContent value="quality" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الاختبارات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    الاختبارات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>نسبة النجاح</span>
                    <Badge variant={codeQuality.testsPassing === codeQuality.testsCount ? 'secondary' : 'destructive'}>
                      {Math.round((codeQuality.testsPassing / codeQuality.testsCount) * 100)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={(codeQuality.testsPassing / codeQuality.testsCount) * 100} 
                    className="h-3" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                      <div className="text-xl font-bold text-success">{codeQuality.testsPassing}</div>
                      <div className="text-xs text-muted-foreground">ناجح</div>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg text-center">
                      <div className="text-xl font-bold text-destructive">
                        {codeQuality.testsCount - codeQuality.testsPassing}
                      </div>
                      <div className="text-xs text-muted-foreground">فاشل</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* تغطية الاختبارات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    تغطية الكود
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>نسبة التغطية</span>
                    <Badge variant={codeQuality.testCoverage >= 80 ? 'secondary' : 'default'}>
                      {codeQuality.testCoverage}%
                    </Badge>
                  </div>
                  <Progress value={codeQuality.testCoverage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-xl font-bold">{codeQuality.lintErrors}</div>
                      <div className="text-xs text-muted-foreground">أخطاء Lint</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <div className="text-xl font-bold">{codeQuality.typeErrors}</div>
                      <div className="text-xs text-muted-foreground">أخطاء TypeScript</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* حالة CI/CD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  حالة CI/CD
                </CardTitle>
                <CardDescription>آخر تشغيل لخط الإنتاج</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {codeQuality.buildStatus === 'success' ? (
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  ) : codeQuality.buildStatus === 'failed' ? (
                    <XCircle className="h-12 w-12 text-destructive" />
                  ) : (
                    <RefreshCw className="h-12 w-12 text-warning animate-spin" />
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">
                      {codeQuality.buildStatus === 'success' ? 'البناء ناجح' :
                       codeQuality.buildStatus === 'failed' ? 'فشل البناء' :
                       'قيد التنفيذ'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      جميع الفحوصات الأمنية والاختبارات مكتملة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الوصول السريع */}
          <TabsContent value="quick-access" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/security">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Shield className="h-10 w-10 text-primary" />
                      <div>
                        <h4 className="font-semibold">لوحة الأمان</h4>
                        <p className="text-sm text-muted-foreground">الأحداث الأمنية ومحاولات الدخول</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/system-monitoring">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Activity className="h-10 w-10 text-info" />
                      <div>
                        <h4 className="font-semibold">مراقبة النظام</h4>
                        <p className="text-sm text-muted-foreground">الأخطاء والتنبيهات والإصلاح</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/system-error-logs">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Bug className="h-10 w-10 text-destructive" />
                      <div>
                        <h4 className="font-semibold">سجل الأخطاء</h4>
                        <p className="text-sm text-muted-foreground">تفاصيل الأخطاء والاستثناءات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/db-health">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Database className="h-10 w-10 text-success" />
                      <div>
                        <h4 className="font-semibold">صحة قاعدة البيانات</h4>
                        <p className="text-sm text-muted-foreground">الأداء والاتصالات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/edge-monitor">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Zap className="h-10 w-10 text-warning" />
                      <div>
                        <h4 className="font-semibold">Edge Functions</h4>
                        <p className="text-sm text-muted-foreground">مراقبة الوظائف السحابية</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/audit-logs">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Eye className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">سجلات التدقيق</h4>
                        <p className="text-sm text-muted-foreground">تتبع العمليات والتغييرات</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
