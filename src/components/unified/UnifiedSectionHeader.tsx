import { ReactNode } from "react";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface UnifiedSectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * UnifiedSectionHeader - رأس قسم موحد
 * يستخدم في بداية كل قسم لتوحيد الشكل
 */
export function UnifiedSectionHeader({
  title,
  description,
  actions,
  icon,
  className,
}: UnifiedSectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4", className)}>
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="space-y-1 min-w-0">
          <h2 className={TYPOGRAPHY.sectionTitle}>{title}</h2>
          {description && (
            <p className={TYPOGRAPHY.caption}>{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
