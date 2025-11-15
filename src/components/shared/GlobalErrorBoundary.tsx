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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error, { 
      context: 'global_error_boundary', 
      severity: 'critical',
      metadata: { errorInfo, errorCount: this.state.errorCount + 1 }
    });
    
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // يمكن إرسال الخطأ لخدمة المراقبة
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
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
              <CardDescription>
                نعتذر عن هذا الخطأ. فريقنا تم إشعاره تلقائياً وسنعمل على حله في أقرب وقت.
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
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={this.handleReset} variant="default" size="lg">
                  <RefreshCcw className="w-4 h-4 ml-2" />
                  إعادة المحاولة
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" size="lg">
                  <Home className="w-4 h-4 ml-2" />
                  العودة للرئيسية
                </Button>
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
