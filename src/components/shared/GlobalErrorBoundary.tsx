import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home, Trash2, Wifi, Download } from 'lucide-react';
import { logger } from '@/lib/logger';
import { logErrorToSupport } from '@/hooks/system/useGlobalErrorLogging';
import { clearAllCaches } from '@/lib/clearCache';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  isClearing: boolean;
  isDynamicImportError: boolean;
  isAutoReloading: boolean;
}

/**
 * فحص إذا كان الخطأ هو خطأ تحميل Dynamic Import
 */
function isDynamicImportError(error: Error | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    msg.includes('dynamically imported module')
  );
}

/**
 * Global Error Boundary لالتقاط جميع الأخطاء في التطبيق
 * مع معالجة محسنة لأخطاء Dynamic Import
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private autoReloadTimeout: ReturnType<typeof setTimeout> | null = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isClearing: false,
      isDynamicImportError: false,
      isAutoReloading: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isDynamic = isDynamicImportError(error);
    return {
      hasError: true,
      error,
      isDynamicImportError: isDynamic,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isDynamic = isDynamicImportError(error);
    
    // تسجيل الخطأ بشكل مختلف حسب النوع
    logger.error(error, { 
      context: 'global_error_boundary', 
      severity: isDynamic ? 'warning' : 'critical',
      metadata: { 
        errorInfo, 
        errorCount: this.state.errorCount + 1,
        errorType: isDynamic ? 'cache_mismatch' : 'runtime_error'
      }
    });
    
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      isDynamicImportError: isDynamic,
    }));

    // إذا كان خطأ Dynamic Import، جرب إعادة التحميل تلقائياً
    if (isDynamic) {
      const reloadCount = parseInt(sessionStorage.getItem('dynamic_import_reload_count') || '0', 10);
      
      if (reloadCount < 2) {
        sessionStorage.setItem('dynamic_import_reload_count', String(reloadCount + 1));
        this.setState({ isAutoReloading: true });
        
        // انتظر 2 ثانية ثم أعد التحميل تلقائياً
        this.autoReloadTimeout = setTimeout(() => {
          this.handleHardRefresh();
        }, 2000);
      } else {
        // بعد محاولتين، أرسل للدعم الفني
        sessionStorage.removeItem('dynamic_import_reload_count');
        await logErrorToSupport(error, errorInfo, this.state.errorCount + 1);
      }
    } else {
      // إرسال إشعار للدعم الفني للأخطاء العادية
      await logErrorToSupport(error, errorInfo, this.state.errorCount + 1);
    }
  }

  componentWillUnmount() {
    if (this.autoReloadTimeout) {
      clearTimeout(this.autoReloadTimeout);
    }
  }

  handleReset = () => {
    if (this.autoReloadTimeout) {
      clearTimeout(this.autoReloadTimeout);
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isDynamicImportError: false,
      isAutoReloading: false,
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
    if (this.autoReloadTimeout) {
      clearTimeout(this.autoReloadTimeout);
    }
    this.setState({ isAutoReloading: false });
  };

  render() {
    if (this.state.hasError) {
      const { isDynamicImportError: isDynamic, isAutoReloading } = this.state;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
                isDynamic ? 'bg-warning/10' : 'bg-destructive/10'
              }`}>
                {isDynamic ? (
                  <Download className="w-6 h-6 text-warning" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isDynamic ? 'جاري تحديث التطبيق...' : 'حدث خطأ غير متوقع'}
              </CardTitle>
              <CardDescription className="space-y-2">
                {isDynamic ? (
                  <>
                    <p>تم اكتشاف إصدار جديد من التطبيق. جاري إعادة التحميل...</p>
                    {isAutoReloading && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <RefreshCcw className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-primary font-medium">جاري إعادة التحميل تلقائياً...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p>نعتذر عن هذا الخطأ. تم إرسال تقرير تلقائي لفريق الدعم الفني.</p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* رسالة خاصة بأخطاء Dynamic Import */}
              {isDynamic && (
                <div className="bg-warning/10 p-4 rounded-lg text-center">
                  <Wifi className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="text-sm text-warning-foreground">
                    يبدو أن هناك تحديث جديد للتطبيق. سيتم إعادة تحميل الصفحة تلقائياً.
                  </p>
                </div>
              )}

              {/* تفاصيل الخطأ (للتطوير فقط) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
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
              {!isDynamic && (
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
              {this.state.errorCount > 1 && !isDynamic && (
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
                    className="w-full"
                  >
                    إلغاء إعادة التحميل التلقائي
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={this.handleHardRefresh} 
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                      disabled={this.state.isClearing}
                    >
                      {this.state.isClearing ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {this.state.isClearing ? 'جاري المسح...' : 'مسح ذاكرة التخزين وإعادة التحميل'}
                    </Button>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button onClick={this.handleReset} variant="outline" size="lg" disabled={this.state.isClearing}>
                        <RefreshCcw className="w-4 h-4 ms-2" />
                        إعادة المحاولة
                      </Button>
                      <Button onClick={this.handleGoHome} variant="ghost" size="lg" disabled={this.state.isClearing}>
                        <Home className="w-4 h-4 ms-2" />
                        العودة للرئيسية
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* معلومات التواصل */}
              {!isDynamic && (
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
