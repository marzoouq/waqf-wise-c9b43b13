import { ReactNode } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { BarChart3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  title?: string;
  description?: string;
  onMessageClick?: () => void;
  children: ReactNode;
}

export function DashboardLayout({ 
  title = "لوحة تحكم المشرف",
  description = "نظرة شاملة على جميع عمليات الوقف",
  onMessageClick,
  children 
}: DashboardLayoutProps) {
  return (
    <PageErrorBoundary pageName="لوحة التحكم">
      <MobileOptimizedLayout>
        <div className="flex items-center justify-between mb-4">
          <MobileOptimizedHeader
            title={title}
            description={description}
            icon={<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          />
          {onMessageClick && (
            <Button onClick={onMessageClick} className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">إرسال رسالة</span>
            </Button>
          )}
        </div>
        {children}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
