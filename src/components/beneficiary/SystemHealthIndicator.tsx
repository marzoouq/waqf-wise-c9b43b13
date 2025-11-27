/**
 * مؤشر صحة النظام في الواجهة
 * System Health Indicator Component
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, AlertTriangle, WifiOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry';

type HealthStatus = 'healthy' | 'degraded' | 'offline';

export function SystemHealthIndicator() {
  const [status, setStatus] = useState<HealthStatus>('healthy');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    // فحص فوري
    checkHealth();

    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkHealth, 30000);

    // الاستماع لحالة الشبكة
    const handleOnline = () => {
      productionLogger.debug('Network back online');
      setStatus('healthy');
      checkHealth();
    };

    const handleOffline = () => {
      productionLogger.warn('Network offline');
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealth = async () => {
    try {
      // فحص سريع للاتصال بقاعدة البيانات مع إعادة محاولة تلقائية
      const { error } = await retryWithBackoff(
        async () => {
          const result = await supabase
            .from('beneficiaries')
            .select('id')
            .limit(1);
          
          // إذا كان هناك خطأ من Supabase، نرميه ليتم التعامل معه
          if (result.error) {
            throw result.error;
          }
          
          return result;
        },
        {
          maxRetries: 2,
          baseDelay: 1000,
          shouldRetry: isRetryableError
        }
      );

      if (error) {
        productionLogger.warn('Health check warning:', error);
        setStatus('degraded');
      } else {
        setStatus('healthy');
        productionLogger.debug('All systems healthy');
      }

      setLastCheck(new Date());
    } catch (error) {
      productionLogger.warn('Health check failed after retries:', error);
      setStatus('degraded');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          label: 'النظام يعمل بشكل طبيعي',
          color: 'text-success',
          bgColor: 'bg-success-light',
          variant: 'default' as const,
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          label: 'النظام يعمل مع بعض المشاكل',
          color: 'text-warning',
          bgColor: 'bg-warning-light',
          variant: 'secondary' as const,
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'لا يوجد اتصال بالإنترنت',
          color: 'text-destructive',
          bgColor: 'bg-destructive-light',
          variant: 'destructive' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (status === 'healthy') {
    // لا نعرض شيء إذا كان كل شيء بخير
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.variant}
            className={`${config.bgColor} ${config.color} cursor-help animate-pulse`}
          >
            <Icon className="h-3 w-3 ml-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            آخر فحص: {lastCheck.toLocaleTimeString('ar-SA')}
          </p>
          {status === 'offline' && (
            <p className="text-xs mt-1">
              سيتم إعادة المحاولة تلقائياً عند عودة الاتصال
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
