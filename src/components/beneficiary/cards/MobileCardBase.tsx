/**
 * مكون البطاقة الأساسي للجوال
 * Base Mobile Card Component
 * 
 * يوفر هيكل موحد لجميع بطاقات الجوال مع:
 * - Header مع أيقونة وعنوان وBadge
 * - Content قابل للتخصيص
 * - Footer اختياري
 */

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileCardBaseProps {
  /** أيقونة الرأس */
  icon?: LucideIcon;
  /** لون خلفية الأيقونة */
  iconBgClassName?: string;
  /** لون الأيقونة */
  iconClassName?: string;
  /** العنوان الرئيسي */
  title: string;
  /** العنوان الفرعي */
  subtitle?: string;
  /** نص البادج */
  badgeText?: string;
  /** نوع البادج */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  /** أيقونة البادج */
  BadgeIcon?: LucideIcon;
  /** محتوى البطاقة */
  children: ReactNode;
  /** محتوى الـ Footer */
  footer?: ReactNode;
  /** classes إضافية للبطاقة */
  className?: string;
  /** عند النقر */
  onClick?: () => void;
}

export function MobileCardBase({
  icon: Icon,
  iconBgClassName = "bg-primary/10",
  iconClassName = "text-primary",
  title,
  subtitle,
  badgeText,
  badgeVariant = "secondary",
  BadgeIcon,
  children,
  footer,
  className,
  onClick,
}: MobileCardBaseProps) {
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {Icon && (
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                iconBgClassName
              )}>
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <p className="font-semibold leading-tight truncate">{title}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {badgeText && (
            <Badge variant={badgeVariant} className="shrink-0 gap-1">
              {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
              {badgeText}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="pt-2 border-t">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="pt-2 border-t">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * صف معلومات داخل البطاقة
 */
export interface CardInfoRowProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
}

export function CardInfoRow({ icon: Icon, label, value, className }: CardInfoRowProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

/**
 * شبكة معلومات بعمودين
 */
export interface CardInfoGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function CardInfoGrid({ children, columns = 2, className }: CardInfoGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * عنصر معلومات مع تسمية
 */
export interface CardInfoItemProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
}

export function CardInfoItem({ icon: Icon, label, value, className }: CardInfoItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
