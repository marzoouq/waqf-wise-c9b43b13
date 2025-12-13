/**
 * AdminDashboardErrorBoundary
 * Error Boundary مخصص للوحة تحكم المشرف
 * يمنع تعطل الصفحة عند حدوث أخطاء في المكونات الفرعية
 */

import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminDashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // يمكن إرسال الخطأ لخدمة مراقبة الأخطاء
    if (import.meta.env.DEV) {
      console.error("AdminDashboard Error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-status-error/30 bg-status-error/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-error">
              <AlertCircle className="h-5 w-5" />
              {this.props.fallbackTitle || "حدث خطأ في تحميل هذا القسم"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "حدث خطأ غير متوقع"}
            </p>
            <Button onClick={this.handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
