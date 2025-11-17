import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
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
      const { supabase } = await import('@/integrations/supabase/client');
      
      // تسجيل الخطأ في جدول error_logs أو إرسال إشعار
      await supabase.from('audit_logs').insert({
        action_type: 'critical_error',
        severity: 'critical',
        description: `خطأ حرج في التطبيق: ${error.message}`,
        table_name: 'application_errors',
        new_values: {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }
      });
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

  handleHardRefresh = () => {
    // مسح الـ cache وإعادة تحميل الصفحة
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
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
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
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
                {this.state.error?.message?.includes('Failed to fetch') && (
                  <Button 
                    onClick={this.handleHardRefresh} 
                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    مسح ذاكرة التخزين وإعادة التحميل
                  </Button>
                )}
                <div className="flex gap-3 justify-center pt-2">
                  <Button onClick={this.handleReset} variant="default" size="lg">
                    <RefreshCcw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" size="lg">
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
