import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  FileWarning,
  Home,
  Clock,
  AlertCircle
} from "lucide-react";
import { useSmartAlerts } from "@/hooks/notifications/useSmartAlerts";
import { useNavigate } from "react-router-dom";
import { format, arLocale as ar } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SmartAlertsSection() {
  const navigate = useNavigate();
  const { data: alerts = [], isLoading, isError, error } = useSmartAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'contract_expiring': return Calendar;
      case 'rent_overdue': return DollarSign;
      case 'loan_due': return FileWarning;
      case 'request_overdue': return Clock;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive-light text-destructive dark:bg-destructive/10 border-destructive/30';
      case 'medium': return 'bg-warning-light text-warning dark:bg-warning/10 border-warning/30';
      case 'low': return 'bg-info-light text-info dark:bg-info/10 border-info/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في جلب التنبيهات الذكية: {error instanceof Error ? error.message : 'خطأ غير معروف'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            التنبيهات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد تنبيهات حاليًا</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">التنبيهات الذكية</span>
            <span className="sm:hidden">التنبيهات</span>
            <Badge variant="secondary" className="text-xs">{alerts.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div 
                key={alert.id}
                className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${getSeverityColor(alert.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => navigate(alert.actionUrl)}
              >
                <div className="p-1.5 sm:p-2 rounded-full bg-background/50 shrink-0">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs sm:text-sm mb-1">{alert.title}</h4>
                  <p className="text-[10px] sm:text-sm opacity-90 mb-1 sm:mb-2 line-clamp-2">{alert.description}</p>
                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs opacity-75">
                    <Calendar className="h-3 w-3" />
                    <span className="hidden sm:inline">{format(alert.date, 'dd MMMM yyyy', { locale: ar })}</span>
                    <span className="sm:hidden">{format(alert.date, 'dd/MM', { locale: ar })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
