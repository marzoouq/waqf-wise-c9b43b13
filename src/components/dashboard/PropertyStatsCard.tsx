import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, TrendingUp, Home } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { safeFilter, safeLength, safeReduce } from '@/lib/utils/array-safe';

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
      value: totalProperties,
      icon: Building,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "إجمالي الوحدات",
      value: totalUnits,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "نسبة الإشغال",
      value: `${occupancyRate}%`,
      subtitle: `${occupiedUnits} مؤجرة / ${vacantUnits} شاغرة`,
      icon: TrendingUp,
      color: occupancyRate >= 80 ? "text-success" : "text-warning",
      bgColor: occupancyRate >= 80 ? "bg-success/10" : "bg-warning/10",
    },
    {
      title: "العوائد الشهرية",
      value: `${monthlyRevenue.toLocaleString('ar-SA')} ريال`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
