/**
 * لوحة تنبيهات الأداء - مع خاصية تجاهل التنبيهات
 * Performance Alerts Panel with Ignore Feature
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw, X, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIgnoredAlerts } from "@/hooks/monitoring/useIgnoredAlerts";
import type { PerformanceAlert } from "@/services/monitoring/db-performance.service";
import { useMemo, useState } from "react";

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
  const { 
    ignoreAlert, 
    unignoreAlert, 
    isIgnored, 
    filterIgnoredAlerts,
    ignoredCount,
    clearAllIgnored,
  } = useIgnoredAlerts();
  
  const [showIgnored, setShowIgnored] = useState(false);

  // فلترة التنبيهات المُتجاهلة
  const visibleAlerts = useMemo(() => {
    return showIgnored ? alerts : filterIgnoredAlerts(alerts);
  }, [alerts, showIgnored, filterIgnoredAlerts]);

  const criticalAlerts = visibleAlerts.filter(a => a.type === 'critical');
  const warningAlerts = visibleAlerts.filter(a => a.type === 'warning');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              التنبيهات
              {visibleAlerts.length > 0 && (
                <Badge variant={criticalAlerts.length > 0 ? 'destructive' : 'outline'}>
                  {visibleAlerts.length}
                </Badge>
              )}
              {ignoredCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {ignoredCount} مُتجاهل
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {lastUpdated && (
                <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {ignoredCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowIgnored(!showIgnored)}
                  >
                    {showIgnored ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showIgnored ? 'إخفاء المُتجاهلة' : 'عرض المُتجاهلة'}
                </TooltipContent>
              </Tooltip>
            )}
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
        </div>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 && !showIgnored ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-success mb-3" />
            <p className="text-lg font-medium">لا توجد تنبيهات</p>
            <p className="text-sm text-muted-foreground">
              أداء قاعدة البيانات ضمن الحدود الطبيعية
            </p>
            {ignoredCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2"
                onClick={clearAllIgnored}
              >
                إلغاء تجاهل الكل ({ignoredCount})
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <AlertItem 
                key={alert.id}
                alert={alert}
                type="critical"
                isIgnored={isIgnored(alert.id)}
                onIgnore={() => ignoreAlert(alert.id)}
                onUnignore={() => unignoreAlert(alert.id)}
              />
            ))}
            
            {warningAlerts.map((alert) => (
              <AlertItem 
                key={alert.id}
                alert={alert}
                type="warning"
                isIgnored={isIgnored(alert.id)}
                onIgnore={() => ignoreAlert(alert.id)}
                onUnignore={() => unignoreAlert(alert.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  alert: PerformanceAlert;
  type: 'critical' | 'warning';
  isIgnored: boolean;
  onIgnore: () => void;
  onUnignore: () => void;
}

function AlertItem({ alert, type, isIgnored, onIgnore, onUnignore }: AlertItemProps) {
  const isCritical = type === 'critical';
  
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg transition-opacity ${
        isIgnored ? 'opacity-50' : ''
      } ${
        isCritical 
          ? 'bg-destructive/10 border border-destructive/20' 
          : 'bg-warning/10 border border-warning/20'
      }`}
    >
      {isCritical ? (
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{alert.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          القيمة: {alert.value.toLocaleString()} | الحد: {alert.threshold.toLocaleString()}
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={isIgnored ? onUnignore : onIgnore}
          >
            {isIgnored ? (
              <Eye className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isIgnored ? 'إلغاء التجاهل' : 'تجاهل هذا التنبيه'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
