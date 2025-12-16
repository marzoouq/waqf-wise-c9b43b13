/**
 * LightErrorBoundary - نسخة خفيفة بدون أي تبعيات خارجية
 * للصفحات العامة (الترحيبية، تسجيل الدخول) فقط
 * ✅ لا يستورد Radix UI أو أي مكتبة تعتمد على React hooks
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LightErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('LightErrorBoundary caught error:', error, errorInfo);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-background p-4" 
          dir="rtl"
        >
          <div className="max-w-md w-full text-center p-8 rounded-lg border border-border bg-card shadow-lg">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-muted-foreground mb-6">
              نعتذر عن هذا الخطأ، يرجى إعادة تحميل الصفحة
            </p>
            <button
              onClick={this.handleRefresh}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
