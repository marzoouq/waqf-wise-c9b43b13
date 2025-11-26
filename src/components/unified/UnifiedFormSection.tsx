import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UnifiedFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * UnifiedFormSection - قسم نموذج موحد
 * يستخدم لتنظيم الحقول في مجموعات منطقية
 */
export function UnifiedFormSection({
  title,
  description,
  children,
  className,
}: UnifiedFormSectionProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", !title && !description && "pt-6")}>
        {children}
      </CardContent>
    </Card>
  );
}
