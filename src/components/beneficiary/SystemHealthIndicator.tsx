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
import { AlertTriangle, WifiOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type HealthStatus = 'healthy' | 'degraded' | 'offline';

export function SystemHealthIndicator() {
  const [status, setStatus] = useState<HealthStatus>('healthy');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [failureCount, setFailureCount] = useState(0);

  useEffect(() => {
    // فحص بعد 5 ثواني (لإعطاء وقت للتطبيق للتحميل)
    const initialTimeout = setTimeout(checkHealth, 5000);

    // فحص دوري كل 60 ثانية
    const interval = setInterval(checkHealth, 60000);

    // الاستماع لحالة الشبكة
    const handleOnline = () => {
      setStatus('healthy');
      setFailureCount(0);
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealth = async () => {
    // إذا كان المتصفح غير متصل، لا نفحص
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error) {
        // نحتاج 3 فشل متتالي قبل إظهار التحذير
        setFailureCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setStatus('degraded');
          }
          return newCount;
        });
      } else {
        setStatus('healthy');
        setFailureCount(0);
      }

      setLastCheck(new Date());
    } catch {
      // أخطاء الشبكة المؤقتة - نحتاج 3 فشل متتالي
      setFailureCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setStatus('degraded');
        }
        return newCount;
      });
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

  // لا نعرض شيء إذا كان كل شيء بخير
  if (status === 'healthy') {
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
