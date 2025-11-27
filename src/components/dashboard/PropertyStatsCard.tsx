import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, TrendingUp, Home } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { safeFilter, safeLength, safeReduce } from '@/lib/utils/array-safe';
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

export const PropertyStatsCard = () => {
  const { properties } = useProperties();
  const { units: propertyUnits } = usePropertyUnits();
  const { payments } = useRentalPayments();

  // حساب الإحصائيات
  const totalProperties = safeLength(properties);
  const totalUnits = safeLength(propertyUnits);
  const occupiedUnits = safeFilter(propertyUnits, u => u.occupancy_status === 'مؤجرة').length;
  const vacantUnits = safeFilter(propertyUnits, u => u.occupancy_status === 'شاغرة').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // حساب العوائد الشهرية
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = safeReduce(
    safeFilter(payments, p => {
      const paymentDate = new Date(p.payment_date || p.due_date);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === 'مدفوع';
    }),
    (sum, p) => sum + (p.amount_paid || 0),
    0
  );

  const stats = [
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
    {
      title: "العوائد الشهرية",
      value: `${monthlyRevenue.toLocaleString('ar-SA')} ر.س`,
      icon: DollarSign,
      variant: "success" as const,
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
      <CardContent>
        <UnifiedStatsGrid columns={4}>
          {stats.map((stat) => (
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
      </CardContent>
    </Card>
  );
};
