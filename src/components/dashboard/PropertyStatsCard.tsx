import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, TrendingUp, Home, Landmark, Receipt, Wallet } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeFilter, safeLength } from '@/lib/utils/array-safe';
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { formatCurrency } from "@/lib/utils";

interface RentalPaymentWithContract {
  amount_paid: number | null;
  tax_amount: number | null;
  contracts: {
    payment_frequency: string | null;
  } | null;
}

export const PropertyStatsCard = () => {
  const { properties } = useProperties();
  const { units: propertyUnits } = usePropertyUnits();

  // جلب المدفوعات الفعلية مع نوع الدفع من العقود
  const { data: payments } = useQuery({
    queryKey: ["rental-payments-with-frequency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_payments")
        .select(`
          amount_paid,
          tax_amount,
          contracts!inner (
            payment_frequency
          )
        `)
        .eq("status", "مدفوع");

      if (error) throw error;
      return (data || []) as RentalPaymentWithContract[];
    },
  });

  // حساب إحصائيات العقارات
  const totalProperties = safeLength(properties);
  const totalUnits = safeLength(propertyUnits);
  const occupiedUnits = safeFilter(propertyUnits, u => u.occupancy_status === 'مؤجرة').length;
  const vacantUnits = safeFilter(propertyUnits, u => u.occupancy_status === 'شاغرة').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // فصل المدفوعات حسب نوع الدفع (سنوي/شهري)
  const annualPayments = payments?.filter(p => p.contracts?.payment_frequency === 'سنوي') || [];
  const monthlyPayments = payments?.filter(p => p.contracts?.payment_frequency === 'شهري') || [];

  // حساب الإيجارات المحصلة
  const totalAnnualCollected = annualPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalMonthlyCollected = monthlyPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalCollected = totalAnnualCollected + totalMonthlyCollected;

  // الضريبة المستقطعة
  const totalTax = payments?.reduce((sum, p) => sum + (p.tax_amount || 0), 0) || 0;

  // صافي الإيرادات
  const netRevenue = totalCollected - totalTax;

  const propertyStats = [
    {
      title: "إجمالي العقارات",
      value: totalProperties.toString(),
      icon: Building,
      variant: "default" as const,
    },
    {
      title: "إجمالي الوحدات",
      value: totalUnits.toString(),
      icon: Home,
      variant: "default" as const,
    },
    {
      title: "نسبة الإشغال",
      value: `${occupancyRate}%`,
      subtitle: `${occupiedUnits} مؤجرة / ${vacantUnits} شاغرة`,
      icon: TrendingUp,
      variant: occupancyRate >= 80 ? ("success" as const) : ("warning" as const),
    },
  ];

  const revenueStats = [
    {
      title: "المبلغ المحصل",
      value: formatCurrency(totalCollected),
      icon: Wallet,
      variant: "success" as const,
    },
    {
      title: "الإيجارات السنوية",
      value: formatCurrency(totalAnnualCollected),
      subtitle: annualPayments.length > 0 ? `${annualPayments.length} دفعة` : undefined,
      icon: Receipt,
      variant: "default" as const,
    },
    {
      title: "الإيجارات الشهرية",
      value: formatCurrency(totalMonthlyCollected),
      subtitle: monthlyPayments.length > 0 ? `${monthlyPayments.length} دفعة` : undefined,
      icon: Receipt,
      variant: "default" as const,
    },
    {
      title: "صافي الإيرادات",
      value: formatCurrency(netRevenue),
      subtitle: "بعد الضريبة",
      icon: TrendingUp,
      variant: "success" as const,
    },
  ];

  const taxStats = [
    {
      title: "ضريبة القيمة المضافة",
      value: formatCurrency(totalTax),
      subtitle: "هيئة الزكاة والضريبة",
      icon: Landmark,
      variant: "danger" as const,
    },
    {
      title: "الزكاة",
      value: formatCurrency(0),
      subtitle: "لم يتم احتسابها",
      icon: Landmark,
      variant: "default" as const,
    },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          إحصائيات العقارات والإيجارات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إحصائيات العقارات */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Building className="h-4 w-4" />
            العقارات والوحدات
          </h4>
          <UnifiedStatsGrid columns={3}>
            {propertyStats.map((stat) => (
              <UnifiedKPICard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                variant={stat.variant}
              />
            ))}
          </UnifiedStatsGrid>
        </div>

        {/* الإيرادات المحصلة */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            الإيرادات المحصلة
          </h4>
          <UnifiedStatsGrid columns={4}>
            {revenueStats.map((stat) => (
              <UnifiedKPICard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                variant={stat.variant}
              />
            ))}
          </UnifiedStatsGrid>
        </div>

        {/* الاستقطاعات الحكومية */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            الاستقطاعات الحكومية
          </h4>
          <UnifiedStatsGrid columns={2}>
            {taxStats.map((stat) => (
              <UnifiedKPICard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                subtitle={stat.subtitle}
                variant={stat.variant}
              />
            ))}
          </UnifiedStatsGrid>
        </div>
      </CardContent>
    </Card>
  );
};
