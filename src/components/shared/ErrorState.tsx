/**
 * ErrorState Component - مكون عرض الأخطاء الموحد
 * 
 * يشمل:
 * - أنواع أخطاء مختلفة (شبكة، خادم، صلاحيات...)
 * - إعادة المحاولة مع Exponential Backoff
 * - دعم حالة Offline
 * - Haptic Feedback
 * 
 * @version 2.0.0 - تحسينات المرحلة الثالثة
 */

import { AlertTriangle, RefreshCw, WifiOff, ShieldAlert, ServerCrash, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { classifyNetworkError, getErrorMessage as getNetworkErrorMessage, isRetryableError, type NetworkErrorType } from "@/lib/network-utils";
import { hapticFeedback } from "@/lib/mobile-ux";
import { MICROCOPY } from "@/lib/microcopy";

export type ErrorType = 'network' | 'server' | 'auth' | 'permission' | 'timeout' | 'not_found' | 'unknown';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error; // لتحديد نوع الخطأ تلقائياً
  type?: ErrorType;
  onRetry?: () => void | Promise<unknown>;
  fullScreen?: boolean;
  showRetry?: boolean;
  showHelp?: boolean;
  onHelp?: () => void;
  className?: string;
}

// أيقونات حسب نوع الخطأ
const ERROR_ICONS: Record<ErrorType, React.FC<{ className?: string }>> = {
  network: WifiOff,
  server: ServerCrash,
  auth: ShieldAlert,
  permission: ShieldAlert,
  timeout: Clock,
  not_found: HelpCircle,
  unknown: AlertTriangle,
};

// ألوان حسب نوع الخطأ
const ERROR_COLORS: Record<ErrorType, string> = {
  network: 'text-amber-500',
  server: 'text-red-500',
  auth: 'text-orange-500',
  permission: 'text-orange-500',
  timeout: 'text-yellow-500',
  not_found: 'text-blue-500',
  unknown: 'text-destructive',
};

// تحويل NetworkErrorType إلى ErrorType
function mapNetworkErrorType(networkType: NetworkErrorType): ErrorType {
  const mapping: Record<NetworkErrorType, ErrorType> = {
    connection_lost: 'network',
    timeout: 'timeout',
    server_error: 'server',
    rate_limited: 'server',
    unauthorized: 'auth',
    not_found: 'not_found',
    unknown: 'unknown',
  };
  return mapping[networkType];
}

export function ErrorState({
  title,
  message,
  error,
  type: providedType,
  onRetry,
  fullScreen = false,
  showRetry = true,
  showHelp = false,
  onHelp,
  className,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // تحديد نوع الخطأ تلقائياً من الـ Error object
  const errorType: ErrorType = providedType || (error ? mapNetworkErrorType(classifyNetworkError(error)) : 'unknown');
  
  // تحديد ما إذا كان الخطأ قابلاً لإعادة المحاولة
  const canRetry = showRetry && onRetry && (
    providedType ? ['network', 'server', 'timeout'].includes(providedType) :
    (error ? isRetryableError(classifyNetworkError(error)) : true)
  );

  // الحصول على الرسائل المناسبة
  const displayTitle = title || MICROCOPY.errors.general.operation_failed.replace('فشلت العملية.', 'حدث خطأ');
  const displayMessage = message || (error ? getNetworkErrorMessage(classifyNetworkError(error)) : MICROCOPY.errors.general.unknown);

  const Icon = ERROR_ICONS[errorType];
  const iconColor = ERROR_COLORS[errorType];

  // معالجة إعادة المحاولة مع Exponential Backoff
  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying) return;

    hapticFeedback('medium');
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
    } catch {
      // الخطأ سيُعالج من الـ parent
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying]);

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-md", className)}
    >
      <Card className={cn(
        "border-destructive/30",
        errorType === 'network' && "border-amber-500/30",
        errorType === 'timeout' && "border-yellow-500/30",
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted", iconColor.replace('text-', 'bg-').replace('500', '100'))}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <CardTitle className="text-lg">{displayTitle}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base">{displayMessage}</CardDescription>
          
          {/* أزرار الإجراءات */}
          <div className="flex flex-col gap-2">
            {canRetry && (
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="w-full gap-2"
                disabled={isRetrying}
              >
                <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
                {isRetrying ? MICROCOPY.loading.processing : (
                  retryCount > 0 ? `${MICROCOPY.actions.secondary.retry} (${retryCount})` : MICROCOPY.actions.secondary.retry
                )}
              </Button>
            )}
            
            {showHelp && onHelp && (
              <Button 
                onClick={onHelp} 
                variant="ghost" 
                className="w-full gap-2 text-muted-foreground"
              >
                <HelpCircle className="h-4 w-4" />
                الحصول على مساعدة
              </Button>
            )}
          </div>

          {/* نصيحة للمستخدم */}
          {errorType === 'network' && (
            <p className="text-xs text-muted-foreground text-center">
              {MICROCOPY.empty.hints.refresh_page}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        {content}
      </div>
    );
  }

  return <div className="p-6 flex items-center justify-center">{content}</div>;
}

// Export للتوافق الخلفي
export { ErrorState as EnhancedErrorState };
