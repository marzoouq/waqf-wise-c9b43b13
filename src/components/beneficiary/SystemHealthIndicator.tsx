/**
 * مؤشر صحة النظام - نظام مراقبة منهجي وتقني
 * System Health Indicator - Methodical Technical Monitoring
 */

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, WifiOff, CheckCircle2, Database, Clock, RefreshCw } from 'lucide-react';
import { useSystemHealthIndicator } from '@/hooks/system/useSystemHealthIndicator';

const THRESHOLDS = {
  SLOW_RESPONSE_MS: 3000,
  CRITICAL_RESPONSE_MS: 8000,
};

export function SystemHealthIndicator() {
  const { status, details, isChecking } = useSystemHealthIndicator();

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          label: 'النظام يعمل بشكل طبيعي',
          color: 'text-success',
          bgColor: 'bg-success/10',
          variant: 'default' as const,
          show: false,
        };
      case 'slow':
        return {
          icon: Clock,
          label: 'استجابة بطيئة',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          variant: 'secondary' as const,
          show: true,
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          label: 'مشكلة في النظام',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          variant: 'secondary' as const,
          show: true,
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'لا يوجد اتصال',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          variant: 'destructive' as const,
          show: true,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // لا نعرض شيء إذا كان كل شيء بخير
  if (!config.show) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.variant}
            className={`${config.bgColor} ${config.color} cursor-help gap-1`}
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Icon className="h-3 w-3" />
            )}
            <span className="text-xs">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2 text-xs">
            {/* حالة قاعدة البيانات */}
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              <span>قاعدة البيانات: </span>
              <span className={details.database === 'ok' ? 'text-success' : 'text-destructive'}>
                {details.database === 'ok' ? 'متصل' : details.database === 'error' ? 'خطأ' : 'غير معروف'}
              </span>
            </div>

            {/* وقت الاستجابة */}
            {details.responseTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>وقت الاستجابة: </span>
                <span className={
                  details.responseTime < THRESHOLDS.SLOW_RESPONSE_MS 
                    ? 'text-success' 
                    : details.responseTime < THRESHOLDS.CRITICAL_RESPONSE_MS 
                      ? 'text-warning' 
                      : 'text-destructive'
                }>
                  {details.responseTime}ms
                </span>
              </div>
            )}

            {/* تفاصيل الخطأ */}
            {details.lastError && (
              <div className="text-destructive border-t pt-2 mt-2">
                <strong>السبب:</strong> {details.lastError}
              </div>
            )}

            {/* نصيحة */}
            {status === 'offline' && (
              <p className="text-muted-foreground border-t pt-2 mt-2">
                تحقق من اتصالك بالإنترنت
              </p>
            )}
            {status === 'slow' && (
              <p className="text-muted-foreground border-t pt-2 mt-2">
                قد يكون الخادم مشغولاً، حاول لاحقاً
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
