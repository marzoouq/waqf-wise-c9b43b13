import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { formatRelative } from "@/lib/date";
import { useAdminAlerts } from '@/hooks/system/useAdminAlerts';
import { ErrorState } from '@/components/shared/ErrorState';

export function AdminAlertsPanel() {
  const { 
    alerts, 
    activeAlerts, 
    isLoading, 
    acknowledge, 
    resolve, 
    isAcknowledging, 
    isResolving,
    error,
    refetch
  } = useAdminAlerts();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };

    const labels: Record<string, string> = {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
    };

    return (
      <Badge variant={variants[severity] || 'default'}>
        {labels[severity] || severity}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            تنبيهات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل تنبيهات النظام" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          تنبيهات النظام
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="mr-auto">
              {activeAlerts.length} نشط
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
            <p>لا توجد تنبيهات حالياً</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="border rounded-lg p-4 space-y-3 bg-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      منذ{' '}
                      {formatRelative(alert.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {alert.status === 'active' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledge(alert.id)}
                      disabled={isAcknowledging}
                    >
                      اعتراف
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => resolve(alert.id)}
                      disabled={isResolving}
                    >
                      حل
                    </Button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <Button
                    size="sm"
                    onClick={() => resolve(alert.id)}
                    disabled={isResolving}
                  >
                    حل
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
