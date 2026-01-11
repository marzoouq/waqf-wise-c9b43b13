import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home, Trash2, Wifi, Download, X } from 'lucide-react';
import { logger } from '@/lib/logger';
import { logErrorToSupport } from '@/hooks/system/useGlobalErrorLogging';
import { clearAllCaches } from '@/lib/clearCache';
import { 
  isChunkLoadError, 
  getChunkErrorInfo, 
  logChunkError,
  type ChunkErrorType 
} from '@/lib/errors/chunk-error-handler';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  isClearing: boolean;
  errorType: ChunkErrorType | null;
  isAutoReloading: boolean;
  autoReloadCountdown: number;
}

const AUTO_RELOAD_DELAY = 3; // seconds

/**
 * Global Error Boundary لالتقاط جميع الأخطاء في التطبيق
 * مع معالجة محسنة لأخطاء Dynamic Import باستخدام النظام الموحد
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private autoReloadTimeout: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isClearing: false,
      errorType: null,
      isAutoReloading: false,
      autoReloadCountdown: AUTO_RELOAD_DELAY,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isChunk = isChunkLoadError(error);
    const errorInfo = isChunk ? getChunkErrorInfo(error) : null;
    
    return {
      hasError: true,
      error,
      errorType: errorInfo?.type || null,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isChunk = isChunkLoadError(error);
    const chunkErrorInfo = isChunk ? getChunkErrorInfo(error) : null;
    
    // Log using unified handler
    if (isChunk) {
      logChunkError(error, { component: 'GlobalErrorBoundary' });
    }
    
    // تسجيل الخطأ
    logger.error(error, { 
      context: 'global_error_boundary', 
      severity: isChunk ? 'warning' : 'critical',
      metadata: { 
        errorInfo, 
        errorCount: this.state.errorCount + 1,
        errorType: chunkErrorInfo?.type || 'runtime_error'
      }
    });
    
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorType: chunkErrorInfo?.type || null,
    }));

    // إذا كان خطأ Chunk، جرب إعادة التحميل تلقائياً
    if (isChunk && chunkErrorInfo?.shouldReload) {
      const reloadCount = parseInt(sessionStorage.getItem('dynamic_import_reload_count') || '0', 10);
      
      if (reloadCount < 2) {
        sessionStorage.setItem('dynamic_import_reload_count', String(reloadCount + 1));
        this.startAutoReload();
      } else {
        // بعد محاولتين، أرسل للدعم الفني
        sessionStorage.removeItem('dynamic_import_reload_count');
        await logErrorToSupport(error, errorInfo, this.state.errorCount + 1);
      }
    } else if (!isChunk) {
      // إرسال إشعار للدعم الفني للأخطاء العادية
      await logErrorToSupport(error, errorInfo, this.state.errorCount + 1);
    }
  }

  startAutoReload = () => {
    this.setState({ 
      isAutoReloading: true, 
      autoReloadCountdown: AUTO_RELOAD_DELAY 
    });
    
    // Countdown
    this.countdownInterval = setInterval(() => {
      this.setState(prev => {
        const newCount = prev.autoReloadCountdown - 1;
        if (newCount <= 0) {
          this.handleHardRefresh();
          return { ...prev, autoReloadCountdown: 0 };
        }
        return { ...prev, autoReloadCountdown: newCount };
      });
    }, 1000);
  };

  componentWillUnmount() {
    if (this.autoReloadTimeout) clearTimeout(this.autoReloadTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  handleReset = () => {
    if (this.autoReloadTimeout) clearTimeout(this.autoReloadTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      isAutoReloading: false,
      autoReloadCountdown: AUTO_RELOAD_DELAY,
    });
  };

  handleHardRefresh = async () => {
    this.setState({ isClearing: true });
    
    try {
      await clearAllCaches();
      localStorage.removeItem('waqf_app_version');
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCancelAutoReload = () => {
    if (this.autoReloadTimeout) clearTimeout(this.autoReloadTimeout);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.setState({ isAutoReloading: false });
  };

  getErrorMessage = (): { title: string; description: string } => {
    const { errorType, error } = this.state;
    
    if (errorType && error) {
      const info = getChunkErrorInfo(error);
      
      switch (errorType) {
        case 'update':
          return {
            title: 'جاري تحديث التطبيق...',
            description: info.userMessage
          };
        case 'network':
          return {
            title: 'مشكلة في الاتصال',
            description: info.userMessage
          };
        case 'server':
          return {
            title: 'خطأ في الخادم',
            description: info.userMessage
          };
        case 'timeout':
          return {
            title: 'انتهت مهلة التحميل',
            description: info.userMessage
          };
        default:
          return {
            title: 'فشل تحميل الصفحة',
            description: info.userMessage
          };
      }
    }
    
    return {
      title: 'حدث خطأ غير متوقع',
      description: 'نعتذر عن هذا الخطأ. تم إرسال تقرير تلقائي لفريق الدعم الفني.'
    };
  };

  render() {
    if (this.state.hasError) {
      const { errorType, isAutoReloading, autoReloadCountdown, isClearing } = this.state;
      const isChunk = errorType !== null;
      const { title, description } = this.getErrorMessage();
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
                isChunk ? 'bg-warning/10' : 'bg-destructive/10'
              }`}>
                {isChunk ? (
                  <Download className="w-6 h-6 text-warning" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-center space-y-2">
                <span className="block">{description}</span>
                {isAutoReloading && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <RefreshCcw className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-primary font-medium">
                      إعادة التحميل خلال {autoReloadCountdown} ثوان...
                    </span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* رسالة خاصة بأخطاء Chunk */}
              {isChunk && !isAutoReloading && (
                <div className="bg-warning/10 p-4 rounded-lg text-center">
                  <Wifi className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="text-sm text-warning-foreground">
                    {errorType === 'network' 
                      ? 'تحقق من اتصالك بالإنترنت'
                      : 'يبدو أن هناك تحديث جديد للتطبيق'
                    }
                  </p>
                </div>
              )}

              {/* تفاصيل الخطأ (للتطوير فقط) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs mt-2 text-muted-foreground overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* معلومات إضافية للأخطاء العادية */}
              {!isChunk && (
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>ماذا يمكنك فعله؟</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>حاول تحديث الصفحة</li>
                    <li>امسح ذاكرة التخزين المؤقت للمتصفح</li>
                    <li>تأكد من اتصالك بالإنترنت</li>
                    <li>حاول مرة أخرى لاحقاً</li>
                  </ul>
                </div>
              )}

              {/* إحصائيات الأخطاء */}
              {this.state.errorCount > 1 && !isChunk && (
                <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
                  ⚠️ تم اكتشاف {this.state.errorCount} أخطاء. يُنصح بإعادة تحميل الصفحة.
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex flex-col gap-3">
                {isAutoReloading ? (
                  <Button 
                    onClick={this.handleCancelAutoReload} 
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء إعادة التحميل التلقائي
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={this.handleHardRefresh} 
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {isClearing ? 'جاري المسح...' : 'مسح ذاكرة التخزين وإعادة التحميل'}
                    </Button>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button 
                        onClick={this.handleReset} 
                        variant="outline" 
                        size="lg" 
                        disabled={isClearing}
                      >
                        <RefreshCcw className="w-4 h-4 ms-2" />
                        إعادة المحاولة
                      </Button>
                      <Button 
                        onClick={this.handleGoHome} 
                        variant="ghost" 
                        size="lg" 
                        disabled={isClearing}
                      >
                        <Home className="w-4 h-4 ms-2" />
                        العودة للرئيسية
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* معلومات التواصل */}
              {!isChunk && (
                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم الفني
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
