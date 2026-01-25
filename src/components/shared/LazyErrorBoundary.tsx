/**
 * Error Boundary specifically for lazy-loaded components
 * يلتقط أخطاء تحميل الـ chunks ويعرض واجهة صديقة للمستخدم
 * 
 * يستخدم النظام الموحد لكشف الأخطاء
 */

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Wifi, WifiOff, Server, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  isChunkLoadError, 
  getChunkErrorInfo, 
  logChunkError,
  type ChunkErrorType 
} from '@/lib/errors/chunk-error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: ChunkErrorType | null;
  isOnline: boolean;
  retryCount: number;
  isRetrying: boolean;
}

const MAX_AUTO_RETRIES = 1; // Reduced from 2

export class LazyErrorBoundary extends Component<Props, State> {
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorInfo = getChunkErrorInfo(error);
    return { 
      hasError: true, 
      error,
      errorType: isChunkLoadError(error) ? errorInfo.type : null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log using unified handler
    if (isChunkLoadError(error)) {
      logChunkError(error, { 
        component: 'LazyErrorBoundary',
        attempt: this.state.retryCount + 1 
      });
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.error('[LazyErrorBoundary] Caught error:', error);
      console.error('[LazyErrorBoundary] Error info:', errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry logic (only once for chunk errors)
    const chunkErrorInfo = getChunkErrorInfo(error);
    if (isChunkLoadError(error) && chunkErrorInfo.canRetry && this.state.retryCount < MAX_AUTO_RETRIES) {
      this.setState({ isRetrying: true });
      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: null,
          errorType: null,
          retryCount: prev.retryCount + 1,
          isRetrying: false
        }));
      }, 1500);
    }
  }

  componentDidMount(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleOnline = (): void => {
    this.setState({ isOnline: true });
    if (this.state.hasError && this.state.errorType === 'network') {
      this.handleRetry();
    }
  };

  handleOffline = (): void => {
    this.setState({ isOnline: false });
  };

  handleRetry = (): void => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.setState({
      hasError: false,
      error: null,
      errorType: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  handleHardRefresh = async (): Promise<void> => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
    } catch (e) {
      console.warn('Failed to clear caches:', e);
    }
    
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  getErrorIcon = (): ReactNode => {
    const { errorType, isOnline } = this.state;
    
    if (!isOnline) return <WifiOff className="w-6 h-6 text-destructive" />;
    
    switch (errorType) {
      case 'network':
        return <Wifi className="w-6 h-6 text-warning" />;
      case 'server':
        return <Server className="w-6 h-6 text-destructive" />;
      case 'timeout':
        return <Clock className="w-6 h-6 text-warning" />;
      default:
        return <AlertCircle className="w-6 h-6 text-destructive" />;
    }
  };

  getErrorTitle = (): string => {
    const { errorType, isOnline } = this.state;
    
    if (!isOnline) return 'لا يوجد اتصال بالإنترنت';
    
    switch (errorType) {
      case 'network':
        return 'مشكلة في الاتصال';
      case 'update':
        return 'تم تحديث التطبيق';
      case 'server':
        return 'خطأ في الخادم';
      case 'timeout':
        return 'انتهت مهلة التحميل';
      default:
        return 'فشل تحميل الصفحة';
    }
  };

  getErrorDescription = (): string => {
    const { error, errorType, isOnline } = this.state;
    
    if (!isOnline) {
      return 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى';
    }
    
    if (error && isChunkLoadError(error)) {
      const errorInfo = getChunkErrorInfo(error);
      return errorInfo.userMessage;
    }
    
    switch (errorType) {
      case 'update':
        return 'يرجى إعادة تحميل الصفحة للحصول على أحدث إصدار';
      default:
        return 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى';
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isOnline, isRetrying, errorType } = this.state;
      const isChunkError = errorType !== null;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4" dir="rtl">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                {this.getErrorIcon()}
              </div>
              <CardTitle className="text-xl">
                {isRetrying ? 'جاري إعادة المحاولة...' : this.getErrorTitle()}
              </CardTitle>
              <CardDescription>
                {isRetrying 
                  ? 'يرجى الانتظار...'
                  : this.getErrorDescription()
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Online status indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-success" />
                    <span>متصل بالإنترنت</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-destructive" />
                    <span>غير متصل</span>
                  </>
                )}
              </div>

              {/* Retry indicator */}
              {isRetrying && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري إعادة التحميل...</span>
                </div>
              )}

              {/* Action buttons */}
              {!isRetrying && (
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={this.handleRetry} 
                    className="w-full"
                    disabled={!isOnline}
                  >
                    <RefreshCw className="w-4 h-4 ms-2" />
                    إعادة المحاولة
                  </Button>
                  
                  {isChunkError && (
                    <Button 
                      variant="outline" 
                      onClick={this.handleHardRefresh}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 ms-2" />
                      تحديث الصفحة بالكامل
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={this.handleGoHome}
                    className="w-full"
                  >
                    <Home className="w-4 h-4 ms-2" />
                    العودة للرئيسية
                  </Button>
                </div>
              )}

              {/* Error details (development only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32 text-left ltr">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyErrorBoundary;
