/**
 * Error Boundary للتبويبات
 * Tab-level Error Boundary
 * 
 * يوفر عزل الأخطاء لكل تبويب بحيث لا يؤثر خطأ في تبويب على باقي التطبيق
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  tabName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(error, {
      context: `tab_error_boundary_${this.props.tabName || "unknown"}`,
      severity: "medium",
      metadata: { errorInfo, tabName: this.props.tabName },
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="h-5 w-5" />
              خطأ في تحميل {this.props.tabName || "التبويب"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              حدث خطأ أثناء عرض هذا القسم. يمكنك المحاولة مرة أخرى.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-xs bg-muted p-2 rounded">
                <summary className="cursor-pointer font-medium">
                  تفاصيل الخطأ (Development)
                </summary>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap text-destructive">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <Button onClick={this.handleRetry} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
