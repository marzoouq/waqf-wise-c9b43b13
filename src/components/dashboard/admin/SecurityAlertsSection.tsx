import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";
import { Shield, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SecurityAlertsSection() {
  const { data: alerts, isLoading } = useSecurityAlerts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            التنبيهات الأمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      default: return 'منخفض';
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            التنبيهات الأمنية
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {criticalCount > 0 && <span className="text-red-600 font-medium">{criticalCount} حرج</span>}
            {criticalCount > 0 && highCount > 0 && <span className="mx-1">•</span>}
            {highCount > 0 && <span className="text-orange-600 font-medium">{highCount} عالي</span>}
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/audit-logs')}
        >
          عرض السجل الكامل
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد تنبيهات أمنية</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityColor(alert.severity)}`}
                      >
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>
                    {alert.user_email && (
                      <p className="text-xs text-muted-foreground">
                        المستخدم: {alert.user_email}
                      </p>
                    )}
                    {alert.ip_address && (
                      <p className="text-xs text-muted-foreground">
                        IP: {alert.ip_address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
