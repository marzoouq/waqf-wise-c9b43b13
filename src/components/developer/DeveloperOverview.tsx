import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";
import { usePerformanceMetrics } from "@/hooks/developer/usePerformanceMetrics";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImageOptimizationPanel } from "./ImageOptimizationPanel";

export function DeveloperOverview() {
  const { systemHealth, vitals } = usePerformanceMetrics();

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "critical": return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">صحة النظام</CardTitle>
            <div className={getHealthColor(systemHealth.overall)}>
              {getHealthIcon(systemHealth.overall)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.score}%
            </div>
            <Progress value={systemHealth.score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {systemHealth.overall === "healthy" ? "النظام يعمل بشكل طبيعي" :
               systemHealth.overall === "warning" ? "يوجد بعض التحذيرات" :
               "يوجد مشاكل حرجة"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Web Vitals</CardTitle>
            <Badge variant="default">
              ممتاز
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals.lcp ? `${(vitals.lcp / 1000).toFixed(1)}s` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              LCP - Largest Contentful Paint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الأخطاء النشطة</CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.activeErrors}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              أخطاء تحتاج إلى معالجة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">طلبات الشبكة</CardTitle>
            <Activity className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.networkRequests}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              طلبات في آخر دقيقة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الصحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">قاعدة البيانات</span>
                <Badge variant={systemHealth.database ? "default" : "destructive"}>
                  {systemHealth.database ? "متصلة" : "غير متصلة"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">التخزين المحلي</span>
                <Badge variant={systemHealth.storage ? "default" : "destructive"}>
                  {systemHealth.storage ? "سليم" : "فشل"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الشبكة</span>
                <Badge variant={systemHealth.network ? "default" : "destructive"}>
                  {systemHealth.network ? "متصل" : "غير متصل"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* لوحة تحسين الصور */}
        <ImageOptimizationPanel />
      </div>
    </div>
  );
}
