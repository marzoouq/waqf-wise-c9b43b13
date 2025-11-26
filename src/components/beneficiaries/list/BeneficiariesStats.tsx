import { Users, UserCheck, UserX, Home } from "lucide-react";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

interface BeneficiariesStatsProps {
  total: number;
  active: number;
  suspended: number;
  families: number;
}

export function BeneficiariesStats({ total, active, suspended, families }: BeneficiariesStatsProps) {
  return (
    <UnifiedStatsGrid columns={{ sm: 2, md: 4 }}>
      <UnifiedKPICard
        title="إجمالي المستفيدين"
        value={total.toString()}
        icon={Users}
        subtitle="جميع الحسابات"
        variant="default"
      />
      
      <UnifiedKPICard
        title="المستفيدين النشطين"
        value={active.toString()}
        icon={UserCheck}
        subtitle="حسابات نشطة"
        variant="success"
      />
      
      <UnifiedKPICard
        title="المعلقين"
        value={suspended.toString()}
        icon={UserX}
        subtitle="حسابات معلقة"
        variant="warning"
      />
      
      <UnifiedKPICard
        title="العائلات"
        value={families.toString()}
        icon={Home}
        subtitle="عائلات مسجلة"
        variant="default"
      />
    </UnifiedStatsGrid>
  );
}
