import { ReactNode } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { getRoleTheme, getRoleDisplayName } from "@/config/roleThemes";
import { cn } from "@/lib/utils";

interface UnifiedDashboardLayoutProps {
  children: ReactNode;
  role: 'nazer' | 'admin' | 'accountant' | 'cashier' | 'archivist' | 'beneficiary' | 'user';
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function UnifiedDashboardLayout({
  children,
  role,
  title,
  description,
  actions,
  className
}: UnifiedDashboardLayoutProps) {
  const theme = getRoleTheme(role);
  const Icon = theme.icon;
  const roleDisplayName = getRoleDisplayName(role);

  return (
    <PageErrorBoundary pageName={title || `لوحة تحكم ${roleDisplayName}`}>
      <MobileOptimizedLayout>
        {/* Header with role-specific styling */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MobileOptimizedHeader
            title={title || `لوحة تحكم ${roleDisplayName}`}
            description={description || `نظرة شاملة على عمليات ${roleDisplayName}`}
            icon={
              <div className={cn(
                "p-2 rounded-lg shadow-md",
                `bg-gradient-to-br ${theme.gradient}`
              )}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary-foreground" />
              </div>
            }
          />
          {actions && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {actions}
            </div>
          )}
        </div>

        {/* Content with consistent spacing */}
        <div className={cn("space-y-4 sm:space-y-6", className)}>
          {children}
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
