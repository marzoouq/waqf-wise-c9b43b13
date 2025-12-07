/**
 * StatusBadge Component
 * مكون موحد لعرض حالات القيود المحاسبية والموافقات
 */

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { LucideIcon } from "lucide-react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
  icon: LucideIcon;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  // حالات الموافقات
  pending: { label: "قيد المراجعة", variant: "secondary", icon: AlertCircle },
  approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
  rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
  // حالات القيود المحاسبية
  draft: { label: "مسودة", variant: "secondary", icon: Clock },
  posted: { label: "مرحّل", variant: "default", icon: CheckCircle },
  cancelled: { label: "ملغى", variant: "destructive", icon: XCircle },
};

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    variant: "outline" as BadgeVariant, 
    icon: FileText 
  };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${className || ""}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

// للاستخدام المباشر في الدوال
export function getStatusBadgeConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status] || { 
    label: status, 
    variant: "outline" as BadgeVariant, 
    icon: FileText 
  };
}
