/**
 * مكون عرض أخطاء تحميل الـ Chunks مع خيارات الاسترداد
 * Chunk Load Error Display Component with Recovery Options
 * 
 * يعرض رسالة مناسبة للمستخدم مع خيارات:
 * - إعادة المحاولة
 * - تحديث الصفحة
 * - الإبلاغ عن المشكلة
 */

import { RefreshCw, WifiOff, AlertTriangle, Server, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChunkErrorInfo, type ChunkErrorType } from '@/lib/errors/chunk-error-handler';
import { cn } from '@/lib/utils';

interface ChunkLoadErrorProps {
  errorInfo?: ChunkErrorInfo;
  onRetry?: () => void;
  onReport?: () => void;
  className?: string;
  compact?: boolean;
}

const ERROR_ICONS: Record<ChunkErrorType, React.ElementType> = {
  network: WifiOff,
  update: RefreshCw,
  server: Server,
  timeout: Clock,
  unknown: AlertTriangle,
};

const ERROR_COLORS: Record<ChunkErrorType, string> = {
  network: 'text-orange-500',
  update: 'text-blue-500',
  server: 'text-red-500',
  timeout: 'text-yellow-500',
  unknown: 'text-muted-foreground',
};

const ERROR_TIPS: Record<ChunkErrorType, string[]> = {
  network: [
    'تحقق من اتصالك بالإنترنت',
    'أعد تشغيل الراوتر أو المودم',
    'جرب الاتصال بشبكة أخرى',
  ],
  update: [
    'تم تحديث النظام إلى إصدار جديد',
    'سيتم تحديث الصفحة تلقائياً',
  ],
  server: [
    'الخادم يواجه مشكلة مؤقتة',
    'انتظر بضع دقائق ثم حاول مرة أخرى',
    'إذا استمرت المشكلة، تواصل مع الدعم',
  ],
  timeout: [
    'سرعة الإنترنت بطيئة',
    'حاول في وقت لاحق',
    'جرب تحديث الصفحة',
  ],
  unknown: [
    'قد تكون هناك مشكلة في الملفات المؤقتة',
    'جرب تحديث الصفحة',
    'إذا استمرت المشكلة، أبلغ الدعم الفني',
  ],
};

export function ChunkLoadError({
  errorInfo,
  onRetry,
  onReport,
  className,
  compact = false,
}: ChunkLoadErrorProps) {
  const type = errorInfo?.type || 'unknown';
  const Icon = ERROR_ICONS[type];
  const colorClass = ERROR_COLORS[type];
  const tips = ERROR_TIPS[type];
  const userMessage = errorInfo?.userMessage || 'حدث خطأ أثناء تحميل الصفحة';
  const canRetry = errorInfo?.canRetry ?? true;
  const shouldReload = errorInfo?.shouldReload ?? false;

  const handleReload = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      handleReload();
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    }
  };

  if (compact) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4 gap-3', className)}>
        <Icon className={cn('w-10 h-10', colorClass)} />
        <p className="text-sm text-muted-foreground text-center">{userMessage}</p>
        <div className="flex gap-2">
          {canRetry && !shouldReload && (
            <Button onClick={handleRetry} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 ms-1" />
              إعادة المحاولة
            </Button>
          )}
          {shouldReload && (
            <Button onClick={handleReload} size="sm">
              <RefreshCw className="w-4 h-4 ms-1" />
              تحديث الصفحة
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <div className={cn('p-4 rounded-full bg-muted/50', colorClass)}>
            <Icon className="w-12 h-12" />
          </div>
        </div>
        <CardTitle className="text-lg">حدث خطأ في التحميل</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">{userMessage}</p>
        
        {tips.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">نصائح للحل:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          {canRetry && !shouldReload && (
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 ms-2" />
              إعادة المحاولة
            </Button>
          )}
          
          {shouldReload && (
            <Button onClick={handleReload} className="w-full">
              <RefreshCw className="w-4 h-4 ms-2" />
              تحديث الصفحة
            </Button>
          )}
          
          {!shouldReload && (
            <Button onClick={handleReload} variant="outline" className="w-full">
              تحديث الصفحة
            </Button>
          )}
          
          {onReport && (
            <Button onClick={handleReport} variant="ghost" size="sm" className="w-full">
              <Send className="w-4 h-4 ms-2" />
              الإبلاغ عن المشكلة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChunkLoadError;
