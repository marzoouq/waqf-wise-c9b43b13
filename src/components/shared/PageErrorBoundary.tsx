import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Page-level Error Boundary Component
 * Catches errors at the page level and provides recovery options
 * Different from the global ErrorBoundary - this is per-page
 */
export class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error, { 
      context: `page_error_boundary_${this.props.pageName || 'unknown'}`, 
      severity: 'high',
      metadata: { errorInfo, pageName: this.props.pageName }
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6 md:p-8">
          <Card className="max-w-2xl mx-auto shadow-strong border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">خطأ في تحميل الصفحة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                عذراً، حدث خطأ أثناء تحميل {this.props.pageName || 'هذه الصفحة'}.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">
                    تفاصيل الخطأ (Development)
                  </summary>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="ms-2 h-4 w-4" />
                  إعادة المحاولة
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                  className="flex-1"
                >
                  <Home className="ms-2 h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
