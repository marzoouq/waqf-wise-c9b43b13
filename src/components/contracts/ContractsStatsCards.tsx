import { memo } from "react";
import { FileText, CheckCircle, Clock, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

interface ContractsStatsProps {
  total: number;
  active: number;
  draft: number;
  readyForRenewal: number;
  autoRenewing: number;
  expired: number;
  onFilterClick?: (filter: string) => void;
  activeFilter?: string;
}

export const ContractsStatsCards = memo(function ContractsStatsCards({
  total,
  active,
  draft,
  readyForRenewal,
  autoRenewing,
  expired,
  onFilterClick,
  activeFilter,
}: ContractsStatsProps) {
  const cards = [
    {
      key: "all",
      title: "جميع العقود",
      value: total,
      icon: FileText,
      variant: "default" as const,
      subtitle: "إجمالي العقود",
    },
    {
      key: "active",
      title: "العقود النشطة",
      value: active,
      icon: CheckCircle,
      variant: "success" as const,
      subtitle: "عقود فعالة",
    },
    {
      key: "draft",
      title: "العقود المسودة",
      value: draft,
      icon: Clock,
      variant: "warning" as const,
      subtitle: "بانتظار التفعيل",
    },
    {
      key: "renewal",
      title: "جاهز للتجديد",
      value: readyForRenewal,
      icon: AlertTriangle,
      variant: "warning" as const,
      subtitle: "ينتهي خلال 60 يوم",
    },
    {
      key: "autoRenew",
      title: "المتجددة تلقائياً",
      value: autoRenewing,
      icon: RefreshCw,
      variant: "success" as const,
      subtitle: "تجديد آلي",
    },
    {
      key: "expired",
      title: "العقود المنتهية",
      value: expired,
      icon: XCircle,
      variant: "destructive" as const,
      subtitle: "عقود منتهية",
    },
  ];

  return (
    <UnifiedStatsGrid columns={{ sm: 2, md: 3, lg: 6 }}>
      {cards.map((card) => (
        <div
          key={card.key}
          onClick={() => onFilterClick?.(card.key)}
          className={`cursor-pointer transition-all duration-200 rounded-lg ${
            activeFilter === card.key
              ? "ring-2 ring-primary ring-offset-2"
              : "hover:scale-[1.02]"
          }`}
        >
          <UnifiedKPICard
            title={card.title}
            value={card.value.toString()}
            icon={card.icon}
            subtitle={card.subtitle}
            variant={card.variant}
          />
        </div>
      ))}
    </UnifiedStatsGrid>
  );
});
