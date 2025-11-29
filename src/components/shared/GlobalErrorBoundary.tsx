import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home, Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
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
}

/**
 * Global Error Boundary لالتقاط جميع الأخطاء في التطبيق
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      isClearing: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error, { 
      context: 'global_error_boundary', 
      severity: 'critical',
      metadata: { errorInfo, errorCount: this.state.errorCount + 1 }
    });
    
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // إرسال إشعار للدعم الفني تلقائياً
    await this.notifySupportTeam(error, errorInfo);
  }

  notifySupportTeam = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // استخدام نظام تسجيل الأخطاء الجديد
      await supabase.functions.invoke('log-error', {
        body: {
          error_type: 'react_component_error',
          error_message: error.message,
          error_stack: error.stack,
          severity: 'critical',
          url: window.location.href,
          user_agent: navigator.userAgent,
          additional_data: {
            component_stack: errorInfo.componentStack,
            error_count: this.state.errorCount + 1,
          },
        },
      });
      
      logger.info('✅ Error logged to support team successfully');
    } catch (notifyError) {
      logger.error(notifyError, { 
        context: 'notify_support_team_failed', 
        severity: 'low'
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleHardRefresh = async () => {
    this.setState({ isClearing: true });
    
    try {
      // مسح الـ cache بشكل شامل
      await clearAllCaches();
      
      // مسح التخزين المحلي للإصدار لإجبار إعادة التحقق
      localStorage.removeItem('waqf_app_version');
      sessionStorage.clear();
      
      // إعادة تحميل الصفحة
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      // إعادة التحميل على أي حال
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">حدث خطأ غير متوقع</CardTitle>
              <CardDescription className="space-y-2">
                <p>نعتذر عن هذا الخطأ. تم إرسال تقرير تلقائي لفريق الدعم الفني.</p>
                {this.state.error?.message?.includes('Failed to fetch') && (
                  <p className="text-warning dark:text-warning font-medium">
                    يبدو أن هناك مشكلة في تحميل أحد مكونات الصفحة. جرب مسح ذاكرة التخزين المؤقت.
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {/* معلومات إضافية */}
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

              {/* إحصائيات الأخطاء */}
              {this.state.errorCount > 1 && (
                <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
                  ⚠️ تم اكتشاف {this.state.errorCount} أخطاء. يُنصح بإعادة تحميل الصفحة.
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex flex-col gap-3">
                {/* زر مسح الذاكرة المؤقتة - دائماً متاح */}
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
                    <RefreshCcw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                  <Button onClick={this.handleGoHome} variant="ghost" size="lg" disabled={this.state.isClearing}>
                    <Home className="w-4 h-4 ml-2" />
                    العودة للرئيسية
                  </Button>
                </div>
              </div>

              {/* معلومات التواصل */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم الفني
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
