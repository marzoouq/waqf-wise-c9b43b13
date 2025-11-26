import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { Database, HardDrive, Clock, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function SystemHealthMonitor() {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            صحة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'سليم';
      case 'degraded': return 'متدهور';
      case 'down': return 'معطل';
      default: return 'غير معروف';
    }
  };

  const storagePercentage = (health.storage.usedSpace / health.storage.totalSpace) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          صحة النظام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* قاعدة البيانات */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">قاعدة البيانات</p>
              <p className="text-xs text-muted-foreground">
                وقت الاستجابة: {health.database.responseTime}ms
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(health.database.status)}>
            {getStatusLabel(health.database.status)}
          </Badge>
        </div>

        {/* التخزين */}
        <div className="space-y-2 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-primary" />
              <p className="font-medium">التخزين</p>
            </div>
            <Badge className={getStatusColor(health.storage.status)}>
              {getStatusLabel(health.storage.status)}
            </Badge>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-left">
            {(health.storage.usedSpace / 1024 / 1024).toFixed(2)} MB / {(health.storage.totalSpace / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </div>

        {/* وقت التشغيل */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">وقت التشغيل</p>
              <p className="text-xs text-muted-foreground">
                {health.uptime.days} يوم، {health.uptime.hours} ساعة
              </p>
            </div>
          </div>
          <Badge className="bg-green-50 text-green-600">
            نشط
          </Badge>
        </div>

        {/* الأداء */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">الأداء</p>
              <p className="text-xs text-muted-foreground">
                {health.performance.requestsPerMinute} طلب/دقيقة
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {health.performance.avgResponseTime}ms
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
