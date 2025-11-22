/**
 * مكون React ذاتي الإصلاح
 * Self-Healing React Component
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { errorTracker } from '@/lib/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * مكون ذاتي الإصلاح يتعافى تلقائياً من الأخطاء
 */
export class SelfHealingComponent extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🔴 Component error caught:', error, errorInfo);

    // تسجيل الخطأ
    errorTracker.logError(
      `Component error: ${error.message}`,
      'high',
      {
        componentName: this.props.componentName || 'Unknown',
        componentStack: errorInfo.componentStack,
        errorStack: error.stack,
      }
    );

    this.setState({ errorInfo });

    // محاولة الاسترجاع التلقائي
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private scheduleRetry = (): void => {
    const delay = this.props.retryDelay || 2000;
    
    console.log(`🔄 Scheduling auto-retry in ${delay}ms...`);
    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = (): void => {
    console.log('🔄 Attempting component recovery...');
    
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
    }));

    errorTracker.logError(
      'Component auto-recovery attempted',
      'low',
      {
        componentName: this.props.componentName || 'Unknown',
        retryCount: this.state.retryCount + 1,
      }
    );
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // عرض Fallback مخصص إذا كان متاحاً
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // عرض واجهة الخطأ الافتراضية
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              حدث خطأ في المكون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">{this.state.error?.message}</p>
              {this.state.errorInfo && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    تفاصيل الخطأ
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                {this.state.isRetrying
                  ? 'جاري الاسترجاع...'
                  : 'إعادة المحاولة'}
              </Button>

              {this.state.retryCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  محاولة {this.state.retryCount} من {this.props.maxRetries || 3}
                </span>
              )}
            </div>

            {this.props.autoRetry && (
              <p className="text-xs text-muted-foreground">
                ⚡ الاسترجاع التلقائي مفعّل - سيتم إعادة المحاولة تلقائياً
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
