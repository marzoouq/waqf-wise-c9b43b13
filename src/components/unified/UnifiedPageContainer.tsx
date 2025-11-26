import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UnifiedPageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

/**
 * UnifiedPageContainer - حاوية موحدة لجميع الصفحات
 * توفر padding و spacing موحد عبر التطبيق
 */
export function UnifiedPageContainer({ 
  children, 
  className,
  maxWidth = "2xl"
}: UnifiedPageContainerProps) {
  return (
    <div className={cn(
      // Container base
      "w-full mx-auto",
      // Responsive padding
      "px-4 sm:px-6 lg:px-8",
      // Vertical spacing
      "py-4 sm:py-6 lg:py-8",
      // Max width
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}
