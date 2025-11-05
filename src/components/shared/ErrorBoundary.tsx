import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full shadow-strong">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">حدث خطأ غير متوقع</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني إذا استمرت المشكلة.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">
                    تفاصيل الخطأ (Development Mode)
                  </summary>
                  <div className="mt-2 space-y-2 text-sm font-mono">
                    <p className="text-destructive font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="overflow-auto text-xs bg-background p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={this.handleReset} className="flex-1">
                  المحاولة مرة أخرى
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                  className="flex-1"
                >
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

export default ErrorBoundary;
