import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  UserCog, 
  Eye, 
  Bell,
  BellOff,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuditAlerts, type AuditAlert } from "@/hooks/system/useAuditAlerts";
import { format } from "@/lib/date";
import { cn } from "@/lib/utils";

interface AuditAlertsCardProps {
  maxAlerts?: number;
  showActions?: boolean;
  className?: string;
}

const alertTypeConfig: Record<AuditAlert['type'], { icon: typeof AlertTriangle; label: string; color: string }> = {
  mass_delete: { icon: Trash2, label: 'حذف جماعي', color: 'text-destructive' },
  financial_change: { icon: DollarSign, label: 'تغيير مالي', color: 'text-warning' },
  role_change: { icon: UserCog, label: 'تغيير أدوار', color: 'text-primary' },
  unusual_access: { icon: Eye, label: 'وصول غير معتاد', color: 'text-info' },
  sensitive_data: { icon: AlertTriangle, label: 'بيانات حساسة', color: 'text-orange-500' },
  failed_access: { icon: XCircle, label: 'محاولة وصول فاشلة', color: 'text-destructive' },
};

const severityConfig: Record<AuditAlert['severity'], { label: string; className: string }> = {
  critical: { label: 'حرج', className: 'bg-destructive text-destructive-foreground' },
  high: { label: 'عالي', className: 'bg-warning text-warning-foreground' },
  medium: { label: 'متوسط', className: 'bg-info text-info-foreground' },
  low: { label: 'منخفض', className: 'bg-muted text-muted-foreground' },
};

export function AuditAlertsCard({ maxAlerts = 10, showActions = true, className }: AuditAlertsCardProps) {
  const { data: alerts = [], isLoading, error, refetch } = useAuditAlerts();

  const displayedAlerts = alerts.slice(0, maxAlerts);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            تنبيهات التدقيق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            خطأ في تحميل التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning" />
          تنبيهات التدقيق
          {(criticalCount > 0 || highCount > 0) && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount + highCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {alerts.length} تنبيه
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-status-success opacity-50" />
            <p>لا توجد تنبيهات</p>
            <p className="text-xs mt-1">النظام يعمل بشكل طبيعي</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {displayedAlerts.map((alert) => {
                const config = alertTypeConfig[alert.type];
                const severity = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      alert.severity === 'critical' && "border-destructive/50 bg-destructive/5",
                      alert.severity === 'high' && "border-warning/50 bg-warning/5",
                      alert.severity === 'medium' && "border-info/50 bg-info/5",
                      alert.severity === 'low' && "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">{alert.title}</span>
                          <Badge className={cn("text-xs", severity.className)}>
                            {severity.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {alert.userEmail && (
                            <span className="truncate max-w-[150px]">{alert.userEmail}</span>
                          )}
                          <span>
                            {format(alert.triggeredAt, "HH:mm dd/MM")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
