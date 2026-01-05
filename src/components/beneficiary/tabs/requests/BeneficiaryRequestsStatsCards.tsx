/**
 * بطاقات إحصائيات الطلبات للمستفيد
 * @version 1.0.0
 */

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from "lucide-react";
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

const statItems = [
  { 
    key: "all", 
    label: "الكل", 
    icon: FileText, 
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    getValue: (s: RequestStats) => s.total
  },
  { 
    key: "pending", 
    label: "قيد الانتظار", 
    icon: Clock, 
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    getValue: (s: RequestStats) => s.pending
  },
  { 
    key: "approved", 
    label: "معتمدة", 
    icon: CheckCircle2, 
    colorClass: "text-success",
    bgClass: "bg-success/10",
    getValue: (s: RequestStats) => s.approved
  },
  { 
    key: "rejected", 
    label: "مرفوضة", 
    icon: XCircle, 
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
    getValue: (s: RequestStats) => s.rejected
  },
  { 
    key: "overdue", 
    label: "متأخرة", 
    icon: AlertTriangle, 
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
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
        const Icon = item.icon;
        const value = item.getValue(stats);
        const isActive = activeFilter === item.key;
        
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
              <div className={cn("p-1.5 rounded-lg", item.bgClass)}>
                <Icon className={cn("h-4 w-4", item.colorClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                <p className={cn("text-lg font-bold", item.colorClass)}>{value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
});
