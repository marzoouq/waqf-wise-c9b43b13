/**
 * مؤشر صحة النظام - نظام مراقبة منهجي وتقني
 * System Health Indicator - Methodical Technical Monitoring
 * 
 * يقوم بفحص:
 * 1. الاتصال بقاعدة البيانات
 * 2. وقت الاستجابة
 * 3. حالة الشبكة
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, WifiOff, CheckCircle2, Database, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry';

type HealthStatus = 'healthy' | 'degraded' | 'offline' | 'slow';

interface HealthDetails {
  database: 'ok' | 'error' | 'unknown';
  responseTime: number;
  networkOnline: boolean;
  lastError?: string;
}

// حدود تقنية واقعية
const THRESHOLDS = {
  SLOW_RESPONSE_MS: 3000,      // 3 ثواني = بطيء
  CRITICAL_RESPONSE_MS: 8000,  // 8 ثواني = مشكلة حقيقية
  CHECK_INTERVAL_MS: 120000,   // فحص كل دقيقتين
  INITIAL_DELAY_MS: 10000,     // انتظار 10 ثواني قبل أول فحص
};

export function SystemHealthIndicator() {
  const [status, setStatus] = useState<HealthStatus>('healthy');
  const [details, setDetails] = useState<HealthDetails>({
    database: 'unknown',
    responseTime: 0,
    networkOnline: true,
  });
  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);

  // فحص صحة النظام بشكل منهجي
  const checkHealth = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // التحقق من الشبكة أولاً
    if (!navigator.onLine) {
      setStatus('offline');
      setDetails(prev => ({ ...prev, networkOnline: false, database: 'unknown' }));
      return;
    }

    setIsChecking(true);
    const startTime = performance.now();

    try {
      // استخدام retry mechanism للتعامل مع الأخطاء المؤقتة
      const { error } = await retryWithBackoff(
        async () => {
          const result = await supabase
            .from('activities')
            .select('id')
            .limit(1)
            .maybeSingle();
          
          if (result.error) throw result.error;
          return result;
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          maxDelay: 2000,
          shouldRetry: isRetryableError
        }
      );

      const responseTime = Math.round(performance.now() - startTime);

      if (!mountedRef.current) return;

      if (error) {
        // خطأ حقيقي من قاعدة البيانات بعد المحاولات
        setStatus('degraded');
        setDetails({
          database: 'error',
          responseTime,
          networkOnline: true,
          lastError: error.message || 'خطأ في الاتصال بقاعدة البيانات',
        });
      } else if (responseTime > THRESHOLDS.CRITICAL_RESPONSE_MS) {
        // استجابة بطيئة جداً - مشكلة حقيقية
        setStatus('degraded');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
          lastError: `استجابة بطيئة جداً: ${responseTime}ms`,
        });
      } else if (responseTime > THRESHOLDS.SLOW_RESPONSE_MS) {
        // استجابة بطيئة - تحذير فقط
        setStatus('slow');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
        });
      } else {
        // كل شيء طبيعي
        setStatus('healthy');
        setDetails({
          database: 'ok',
          responseTime,
          networkOnline: true,
        });
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      const responseTime = Math.round(performance.now() - startTime);
      
      // التمييز بين أنواع الأخطاء
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        // مشكلة شبكة حقيقية
        setStatus('offline');
        setDetails({
          database: 'unknown',
          responseTime,
          networkOnline: false,
          lastError: 'فشل في الاتصال بالخادم',
        });
      } else {
        // مشكلة في قاعدة البيانات
        setStatus('degraded');
        setDetails({
          database: 'error',
          responseTime,
          networkOnline: true,
          lastError: errorMessage,
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // فحص بعد فترة انتظار (لإعطاء التطبيق وقت للتحميل)
    const initialTimeout = setTimeout(checkHealth, THRESHOLDS.INITIAL_DELAY_MS);

    // فحص دوري
    const interval = setInterval(checkHealth, THRESHOLDS.CHECK_INTERVAL_MS);

    // الاستماع لتغييرات الشبكة
    const handleOnline = () => {
      setDetails(prev => ({ ...prev, networkOnline: true }));
      // فحص فوري عند عودة الشبكة
      checkHealth();
    };

    const handleOffline = () => {
      setStatus('offline');
      setDetails(prev => ({ ...prev, networkOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          label: 'النظام يعمل بشكل طبيعي',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          variant: 'default' as const,
          show: false,
        };
      case 'slow':
        return {
          icon: Clock,
          label: 'استجابة بطيئة',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          variant: 'secondary' as const,
          show: true,
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          label: 'مشكلة في النظام',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          variant: 'secondary' as const,
          show: true,
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'لا يوجد اتصال',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
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
              <span className={details.database === 'ok' ? 'text-green-500' : 'text-red-500'}>
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
                    ? 'text-green-500' 
                    : details.responseTime < THRESHOLDS.CRITICAL_RESPONSE_MS 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                }>
                  {details.responseTime}ms
                </span>
              </div>
            )}

            {/* تفاصيل الخطأ */}
            {details.lastError && (
              <div className="text-red-400 border-t pt-2 mt-2">
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
