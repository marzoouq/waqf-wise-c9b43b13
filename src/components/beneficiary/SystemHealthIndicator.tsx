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
import { debug } from '@/lib/debug';

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
      debug.network('Network back online');
      setStatus('healthy');
      checkHealth();
    };

    const handleOffline = () => {
      debug.warn('Network offline');
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
      // فحص سريع للاتصال بقاعدة البيانات
      const { error } = await supabase
        .from('beneficiaries')
        .select('id')
        .limit(1);

      if (error) {
        debug.warn('Health check warning:', error);
        setStatus('degraded');
      } else {
        setStatus('healthy');
      }

      setLastCheck(new Date());
    } catch (error) {
      debug.warn('Health check failed:', error);
      setStatus('degraded');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          label: 'النظام يعمل بشكل طبيعي',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
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
          color: 'text-red-600',
          bgColor: 'bg-red-50',
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
