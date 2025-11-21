import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // تسجيل الخطأ وإرسال إشعار للدعم الفني
    await this.logErrorToSupport(error, errorInfo);
  }

  async logErrorToSupport(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        error_type: 'react_error',
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        severity: 'high',
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // استدعاء Edge Function لتسجيل الخطأ وإرسال الإشعار
      await supabase.functions.invoke('log-error', {
        body: errorData,
      });

      // تسجيل في الـ console للتطوير
      console.error('🔴 Error caught by ErrorBoundary:', {
        error,
        errorInfo,
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">حدث خطأ غير متوقع</CardTitle>
                  <CardDescription>
                    عذراً، حدث خطأ في التطبيق. تم إرسال تقرير تلقائي للدعم الفني.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono text-muted-foreground">
                  {this.state.error?.message}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ تم إرسال تقرير الخطأ تلقائياً إلى فريق الدعم الفني
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  سيتم معالجة المشكلة في أقرب وقت ممكن
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة المحاولة
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    تفاصيل تقنية (للمطورين)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
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
