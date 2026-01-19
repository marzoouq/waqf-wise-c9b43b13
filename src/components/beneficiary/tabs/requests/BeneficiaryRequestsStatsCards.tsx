/**
 * بطاقات إحصائيات الطلبات للمستفيد
 * تستخدم UnifiedKPICard مع دعم الفلترة التفاعلية
 * @version 3.0.0 - محدث لاستخدام UnifiedKPICard
 */

import { memo } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from "lucide-react";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { cn } from "@/lib/utils";

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

type VariantType = 'primary' | 'success' | 'warning' | 'destructive' | 'danger';

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

export const BeneficiaryRequestsStatsCards = memo(function BeneficiaryRequestsStatsCards({
  stats,
  activeFilter,
  onFilterChange,
}: BeneficiaryRequestsStatsCardsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
      {statItems.map((item) => {
        const value = item.getValue(stats);
        const isActive = activeFilter === item.key;
        
        return (
          <div
            key={item.key}
            className={cn(
              "shrink-0 min-w-[100px] md:min-w-0 transition-all",
              isActive && "ring-2 ring-primary rounded-lg"
            )}
          >
            <UnifiedKPICard
              title={item.label}
              value={value}
              icon={item.icon}
              variant={item.variant}
              size="compact"
              onClick={() => onFilterChange(item.key)}
            />
          </div>
        );
      })}
    </div>
  );
});
