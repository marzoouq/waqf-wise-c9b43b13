import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function PropertyStatsCards() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          name,
          location,
          total_units,
          occupied_units
        `)
        .eq("status", "نشط")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["active-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, monthly_rent")
        .eq("status", "نشط");

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalProperties = properties?.length || 0;
  const totalUnits = properties?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;
  const occupiedUnits = properties?.reduce((sum, p) => sum + (p.occupied_units || 0), 0) || 0;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  const totalMonthlyRent = contracts?.reduce((sum, c) => sum + (c.monthly_rent || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* إحصائيات العقارات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي العقارات"
          value={totalProperties}
          icon={Building2}
          colorClass="text-blue-600"
        />
        <StatsCard
          title="إجمالي الوحدات"
          value={totalUnits}
          icon={Home}
          trend={`${occupiedUnits} مشغولة • ${vacantUnits} شاغرة`}
          colorClass="text-green-600"
        />
        <StatsCard
          title="معدل الإشغال"
          value={`${occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          colorClass="text-amber-600"
        />
        <StatsCard
          title="الإيجارات الشهرية"
          value={formatCurrency(totalMonthlyRent)}
          icon={DollarSign}
          colorClass="text-purple-600"
        />
      </div>

      {/* نظرة سريعة على العقارات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            نظرة سريعة على العقارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <div className="space-y-2">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/50 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{property.total_units || 0} وحدة</Badge>
                    <Badge className="bg-green-500/10 text-green-700 border-green-200">
                      {property.occupied_units || 0} مشغول
                    </Badge>
                    <Badge variant="secondary">
                      {(property.total_units || 0) - (property.occupied_units || 0)} شاغر
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">لا توجد عقارات متاحة</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
