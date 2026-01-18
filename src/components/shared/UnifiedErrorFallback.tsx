/**
 * UnifiedErrorFallback - مكون عرض الأخطاء الموحد
 * 
 * يُستخدم مع Error Boundaries لعرض رسائل خطأ موحدة ومتسقة
 * 
 * @version 1.0.0
 */

import { AlertTriangle, RefreshCw, Home, WifiOff, ServerCrash, ShieldAlert, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type UnifiedErrorType = 
  | 'network' 
  | 'server' 
  | 'auth' 
  | 'permission' 
  | 'timeout' 
  | 'not_found' 
  | 'component' 
  | 'unknown';

interface UnifiedErrorFallbackProps {
  /** نوع الخطأ لتحديد الأيقونة والرسالة */
  type?: UnifiedErrorType;
  /** عنوان مخصص */
  title?: string;
  /** رسالة مخصصة */
  message?: string;
  /** كائن الخطأ الأصلي */
  error?: Error | null;
  /** اسم الصفحة/المكون */
  componentName?: string;
  /** دالة إعادة المحاولة */
  onRetry?: () => void;
  /** دالة العودة للرئيسية */
  onGoHome?: () => void;
  /** إظهار زر إعادة المحاولة */
  showRetry?: boolean;
  /** إظهار زر العودة للرئيسية */
  showGoHome?: boolean;
  /** إظهار تفاصيل الخطأ (للمطورين) */
  showDetails?: boolean;
  /** عرض كامل الشاشة */
  fullScreen?: boolean;
  /** أسلوب إضافي */
  className?: string;
}

// أيقونات حسب نوع الخطأ
const ERROR_ICONS: Record<UnifiedErrorType, React.FC<{ className?: string }>> = {
  network: WifiOff,
  server: ServerCrash,
  auth: ShieldAlert,
  permission: ShieldAlert,
  timeout: Clock,
  not_found: HelpCircle,
  component: AlertTriangle,
  unknown: AlertTriangle,
};

// ألوان حسب نوع الخطأ
const ERROR_STYLES: Record<UnifiedErrorType, { iconColor: string; borderColor: string; bgColor: string }> = {
  network: { 
    iconColor: 'text-amber-500', 
    borderColor: 'border-amber-500/30', 
    bgColor: 'bg-amber-100 dark:bg-amber-900/20' 
  },
  server: { 
    iconColor: 'text-red-500', 
    borderColor: 'border-red-500/30', 
    bgColor: 'bg-red-100 dark:bg-red-900/20' 
  },
  auth: { 
    iconColor: 'text-orange-500', 
    borderColor: 'border-orange-500/30', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/20' 
  },
  permission: { 
    iconColor: 'text-orange-500', 
    borderColor: 'border-orange-500/30', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/20' 
  },
  timeout: { 
    iconColor: 'text-yellow-500', 
    borderColor: 'border-yellow-500/30', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' 
  },
  not_found: { 
    iconColor: 'text-blue-500', 
    borderColor: 'border-blue-500/30', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/20' 
  },
  component: { 
    iconColor: 'text-destructive', 
    borderColor: 'border-destructive/30', 
    bgColor: 'bg-destructive/10' 
  },
  unknown: { 
    iconColor: 'text-destructive', 
    borderColor: 'border-destructive/30', 
    bgColor: 'bg-destructive/10' 
  },
};

// رسائل افتراضية حسب نوع الخطأ
const DEFAULT_MESSAGES: Record<UnifiedErrorType, { title: string; message: string }> = {
  network: { 
    title: 'انقطع الاتصال', 
    message: 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.' 
  },
  server: { 
    title: 'خطأ في الخادم', 
    message: 'حدث خطأ في الخادم. الفريق التقني يعمل على حل المشكلة.' 
  },
  auth: { 
    title: 'انتهت الجلسة', 
    message: 'يرجى تسجيل الدخول مرة أخرى للمتابعة.' 
  },
  permission: { 
    title: 'غير مصرح', 
    message: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.' 
  },
  timeout: { 
    title: 'انتهت المهلة', 
    message: 'استغرق الطلب وقتاً طويلاً. حاول مرة أخرى.' 
  },
  not_found: { 
    title: 'غير موجود', 
    message: 'المحتوى المطلوب غير موجود أو تم نقله.' 
  },
  component: { 
    title: 'خطأ في تحميل المكون', 
    message: 'حدث خطأ أثناء تحميل هذا القسم.' 
  },
  unknown: { 
    title: 'حدث خطأ', 
    message: 'عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.' 
  },
};

export function UnifiedErrorFallback({
  type = 'unknown',
  title,
  message,
  error,
  componentName,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = true,
  showDetails = import.meta.env.DEV,
  fullScreen = false,
  className,
}: UnifiedErrorFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const Icon = ERROR_ICONS[type];
  const styles = ERROR_STYLES[type];
  const defaults = DEFAULT_MESSAGES[type];

  const displayTitle = title || defaults.title;
  const displayMessage = message || (componentName 
    ? `${defaults.message} (${componentName})` 
    : defaults.message);

  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await Promise.resolve(onRetry());
    } catch {
      // الخطأ سيُعالج من المستدعي
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying]);

  const handleGoHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  }, [onGoHome]);

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-md", className)}
    >
      <Card className={cn("shadow-lg", styles.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-full", styles.bgColor)}>
              <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
            <CardTitle className="text-xl">{displayTitle}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {displayMessage}
          </CardDescription>

          {/* تفاصيل الخطأ للمطورين */}
          {showDetails && error && (
            <details className="p-4 bg-muted rounded-lg text-xs">
              <summary className="cursor-pointer font-medium mb-2 text-sm">
                تفاصيل الخطأ (Development)
              </summary>
              <div className="space-y-2 overflow-auto">
                <p><strong>النوع:</strong> {error.name}</p>
                <p><strong>الرسالة:</strong> {error.message}</p>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-2">
            {showRetry && onRetry && (
              <Button 
                onClick={handleRetry} 
                className="flex-1 gap-2"
                disabled={isRetrying}
              >
                <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
                {isRetrying 
                  ? 'جاري المحاولة...' 
                  : retryCount > 0 
                    ? `إعادة المحاولة (${retryCount})` 
                    : 'إعادة المحاولة'
                }
              </Button>
            )}
            
            {showGoHome && (
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1 gap-2"
              >
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            )}
          </div>

          {/* نصيحة إضافية */}
          {type === 'network' && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              💡 تحقق من اتصالك بالإنترنت ثم اضغط إعادة المحاولة
            </p>
          )}
          
          {type === 'auth' && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              💡 ستحتاج لتسجيل الدخول مرة أخرى
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

export default UnifiedErrorFallback;
