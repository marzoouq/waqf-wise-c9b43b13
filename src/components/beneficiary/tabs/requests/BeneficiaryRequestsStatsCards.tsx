/**
 * بطاقات إحصائيات الطلبات للمستفيد
 * تستخدم CompactKPICard للعرض المضغوط مع دعم الفلترة
 * @version 2.0.0
 */

import { memo } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
}

interface BeneficiaryRequestsStatsCardsProps {
  stats: RequestStats;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

type VariantType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'destructive';

const statItems: Array<{
  key: string;
  label: string;
  icon: typeof FileText;
  variant: VariantType;
  getValue: (s: RequestStats) => number;
}> = [
  { 
    key: "all", 
    label: "الكل", 
    icon: FileText, 
    variant: "primary",
    getValue: (s: RequestStats) => s.total
  },
  { 
    key: "pending", 
    label: "قيد الانتظار", 
    icon: Clock, 
    variant: "warning",
    getValue: (s: RequestStats) => s.pending
  },
  { 
    key: "approved", 
    label: "معتمدة", 
    icon: CheckCircle2, 
    variant: "success",
    getValue: (s: RequestStats) => s.approved
  },
  { 
    key: "rejected", 
    label: "مرفوضة", 
    icon: XCircle, 
    variant: "destructive",
    getValue: (s: RequestStats) => s.rejected
  },
  { 
    key: "overdue", 
    label: "متأخرة", 
    icon: AlertTriangle, 
    variant: "danger",
    getValue: (s: RequestStats) => s.overdue
  },
];

const variantStyles: Record<VariantType, { bg: string; text: string }> = {
  default: { bg: "bg-muted/50", text: "text-foreground" },
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
  danger: { bg: "bg-destructive/10", text: "text-destructive" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive" },
  info: { bg: "bg-info/10", text: "text-info" },
};

export const BeneficiaryRequestsStatsCards = memo(function BeneficiaryRequestsStatsCards({
  stats,
  activeFilter,
  onFilterChange,
}: BeneficiaryRequestsStatsCardsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = item.getValue(stats);
        const isActive = activeFilter === item.key;
        const styles = variantStyles[item.variant];
        
        return (
          <Card
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            className={cn(
              "shrink-0 cursor-pointer transition-all duration-200 p-3 min-w-[100px] md:min-w-0",
              "hover:shadow-md hover:scale-[1.02]",
              isActive 
                ? "ring-2 ring-primary shadow-md" 
                : "hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", styles.bg)}>
                <Icon className={cn("h-4 w-4", styles.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className={cn("text-lg font-bold", styles.text)}>{value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
});
