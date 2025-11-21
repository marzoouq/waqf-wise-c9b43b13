import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package, MapPin } from "lucide-react";
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

      {/* نظرة سريعة على العقارات - تصميم محسّن */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-background pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            نظرة سريعة على العقارات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-base">{property.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {property.total_units || 0} وحدة
                          </Badge>
                          <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">
                            {property.occupied_units || 0} مشغول
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(property.total_units || 0) - (property.occupied_units || 0)} شاغر
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد عقارات متاحة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
