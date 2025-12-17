import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  // دعم الـ API القديم
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  // دعم الـ API الجديد (من EnhancedEmptyState)
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

/**
 * EmptyState - مكون موحد لعرض حالة عدم وجود بيانات
 * يدعم كلا الـ APIs: القديم (actionLabel/onAction) والجديد (action/secondaryAction/tips)
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  action,
  secondaryAction,
  tips,
}: EmptyStateProps) {
  // تحديد الـ API المستخدم
  const hasNewAPI = action || secondaryAction || tips;
  const hasOldAPI = actionLabel && onAction;

  // إذا كان يستخدم الـ API الجديد (المتقدم)
  if (hasNewAPI) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

          {action && (
            <div className="flex gap-3">
              <Button onClick={action.onClick} size="lg">
                {action.icon && <action.icon className="h-5 w-5 ms-2" />}
                {action.label}
              </Button>
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  size="lg"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}

          {tips && tips.length > 0 && (
            <div className="mt-8 pt-6 border-t w-full max-w-lg">
              <h4 className="text-sm font-semibold mb-3 text-foreground/80">
                💡 نصائح مفيدة:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground text-right">
                {tips.map((tip) => (
                  <li key={`tip-${tip.substring(0, 20)}`} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // الـ API القديم (البسيط)
  return (
    <Card className={cn("shadow-soft", className)}>
      <CardContent className="py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        {hasOldAPI && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// تصدير EnhancedEmptyState كـ alias للتوافق الخلفي
export { EmptyState as EnhancedEmptyState };
