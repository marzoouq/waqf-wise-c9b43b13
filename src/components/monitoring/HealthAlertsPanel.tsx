/**
 * لوحة تنبيهات صحة قاعدة البيانات
 * Database Health Alerts Panel
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, RefreshCw, XCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { HealthAlert } from "@/services/monitoring/db-health.service";

interface HealthAlertsPanelProps {
  alerts: HealthAlert[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export function HealthAlertsPanel({ alerts, isLoading, onRefresh, lastUpdated }: HealthAlertsPanelProps) {
  const getAlertIcon = (type: HealthAlert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: HealthAlert['type']) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">حرج</Badge>;
      case 'warning':
        return <Badge variant="secondary">تحذير</Badge>;
      case 'info':
        return <Badge variant="outline">معلومات</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            {alerts.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            التنبيهات
            {alerts.length > 0 && <Badge variant="secondary">{alerts.length}</Badge>}
          </CardTitle>
          <CardDescription>
            {lastUpdated && `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-SA')}`}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
            <p>لا توجد تنبيهات - قاعدة البيانات في حالة جيدة</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.title}</span>
                        {getAlertBadge(alert.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {alert.value !== undefined && alert.threshold !== undefined && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          القيمة: {alert.value.toLocaleString()} | الحد: {alert.threshold.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
