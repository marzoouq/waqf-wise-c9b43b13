/**
 * لوحة تنبيهات الأداء
 * Performance Alerts Panel
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import type { PerformanceAlert } from "@/services/monitoring/db-performance.service";

interface PerformanceAlertsPanelProps {
  alerts: PerformanceAlert[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export function PerformanceAlertsPanel({ 
  alerts, 
  isLoading, 
  onRefresh,
  lastUpdated 
}: PerformanceAlertsPanelProps) {
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              التنبيهات
              {alerts.length > 0 && (
                <Badge variant={criticalAlerts.length > 0 ? 'destructive' : 'outline'}>
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {lastUpdated && (
                <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}</span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-success mb-3" />
            <p className="text-lg font-medium">لا توجد تنبيهات</p>
            <p className="text-sm text-muted-foreground">
              أداء قاعدة البيانات ضمن الحدود الطبيعية
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    القيمة: {alert.value.toLocaleString()} | الحد: {alert.threshold.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {warningAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
              >
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    القيمة: {alert.value.toLocaleString()} | الحد: {alert.threshold.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
