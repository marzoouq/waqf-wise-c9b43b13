/**
 * Error Boundary specifically for lazy-loaded components
 * يلتقط أخطاء تحميل الـ chunks ويعرض واجهة صديقة للمستخدم
 * 
 * Standard pattern used by major tech companies
 */

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOnline: boolean;
  retryCount: number;
}

const MAX_AUTO_RETRIES = 2;

export class LazyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    console.error('[LazyErrorBoundary] Caught error:', error);
    console.error('[LazyErrorBoundary] Error info:', errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Check if it's a chunk loading error
    const isChunkError = this.isChunkLoadError(error);
    
    if (isChunkError && this.state.retryCount < MAX_AUTO_RETRIES) {
      // Auto-retry for chunk errors
      setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1
        }));
      }, 1000 * (this.state.retryCount + 1));
    }
  }

  componentDidMount(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = (): void => {
    this.setState({ isOnline: true });
    // Auto-retry when coming back online
    if (this.state.hasError) {
      this.handleRetry();
    }
  };

  handleOffline = (): void => {
    this.setState({ isOnline: false });
  };

  isChunkLoadError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('loading chunk') ||
      message.includes('loading css chunk') ||
      message.includes('dynamically imported module') ||
      message.includes('failed to fetch') ||
      error.name === 'ChunkLoadError'
    );
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  handleHardRefresh = async (): Promise<void> => {
    try {
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
    } catch (e) {
      console.warn('Failed to clear caches:', e);
    }
    
    // Force reload
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError = this.state.error && this.isChunkLoadError(this.state.error);
      const { isOnline } = this.state;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4" dir="rtl">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                {!isOnline ? (
                  <WifiOff className="w-6 h-6 text-destructive" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl">
                {!isOnline 
                  ? 'لا يوجد اتصال بالإنترنت'
                  : isChunkError 
                    ? 'فشل تحميل الصفحة'
                    : 'حدث خطأ غير متوقع'
                }
              </CardTitle>
              <CardDescription>
                {!isOnline 
                  ? 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى'
                  : isChunkError
                    ? 'هناك تحديث جديد للتطبيق. يرجى إعادة تحميل الصفحة.'
                    : 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Online status indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span>متصل بالإنترنت</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-destructive" />
                    <span>غير متصل</span>
                  </>
                )}
              </div>

              {/* Action buttons */}
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

              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
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
