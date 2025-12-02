import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Home, 
  CreditCard,
  Wallet,
  PieChart
} from "lucide-react";
import { useNazerKPIs } from "@/hooks/useNazerKPIs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedSectionHeader } from "@/components/unified/UnifiedSectionHeader";

export default function NazerKPIs() {
  const { data, isLoading, isError, error } = useNazerKPIs();

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في جلب البيانات: {error instanceof Error ? error.message : 'خطأ غير معروف'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <UnifiedSectionHeader 
          title="إحصائيات الناظر"
          description="نظرة شاملة على جميع أنشطة النظام"
        />
        <UnifiedStatsGrid columns={4}>
          {[...Array(8)].map((_, i) => (
            <UnifiedKPICard 
              key={`skeleton-${i}`}
              title="جاري التحميل..."
              value="..."
              icon={Building2}
              loading={true}
            />
          ))}
        </UnifiedStatsGrid>
      </section>
    );
  }

  const kpiCards = [
    {
      title: "المستفيدون النشطون",
      value: data.activeBeneficiaries,
      icon: Users,
      variant: "default" as const,
      subtitle: "عدد المستفيدين"
    },
    {
      title: "العقارات النشطة",
      value: data.activeProperties,
      icon: Home,
      variant: "warning" as const,
      subtitle: "العقارات المسجلة"
    },
    {
      title: "العقارات المؤجرة",
      value: data.occupiedProperties,
      icon: Building2,
      variant: "default" as const,
    },
    {
      title: "القروض المستحقة",
      value: data.pendingLoans,
      icon: CreditCard,
      variant: "danger" as const,
      subtitle: "القروض النشطة"
    }
  ];

  return (
    <section>
      <UnifiedSectionHeader 
        title="إحصائيات الناظر"
        description="نظرة شاملة على جميع أنشطة النظام"
      />
      
      <UnifiedStatsGrid columns={4}>
        {kpiCards.map((kpi) => (
          <UnifiedKPICard 
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            variant={kpi.variant}
            subtitle={kpi.subtitle}
          />
        ))}
      </UnifiedStatsGrid>
    </section>
  );
}
