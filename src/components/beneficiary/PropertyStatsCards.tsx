import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package, MapPin, ChevronDown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
          occupied_units,
          status
        `)
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
        .select("id, monthly_rent, status")
        .in("status", ["نشط", "active"]);

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
          colorClass="text-info"
        />
        <StatsCard
          title="إجمالي الوحدات"
          value={totalUnits}
          colorClass="text-info"
          icon={Home}
        />
        <StatsCard
          title="الوحدات المشغولة"
          value={occupiedUnits}
          colorClass="text-success"
          icon={CheckCircle}
        />
        <StatsCard
          title="معدل الإشغال"
          value={`${occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          colorClass="text-warning"
        />
        <StatsCard
          title="الإيجارات الشهرية"
          value={formatCurrency(totalMonthlyRent)}
          icon={DollarSign}
          colorClass="text-accent"
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
            <Accordion type="single" collapsible className="space-y-3">
              {properties.map((property) => (
                <AccordionItem
                  key={property.id}
                  value={property.id}
                  className="border border-border/50 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <h4 className="font-semibold text-base">{property.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {property.total_units || 0} وحدة
                        </Badge>
                        <Badge className="bg-success-light text-success border-success text-xs">
                          {property.occupied_units || 0} مشغول
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(property.total_units || 0) - (property.occupied_units || 0)} شاغر
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <PropertyUnitsDisplay propertyId={property.id} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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

// مكون فرعي لعرض وحدات العقار
function PropertyUnitsDisplay({ propertyId }: { propertyId: string }) {
  const { data: units, isLoading } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_units")
        .select(`
          id,
          unit_number,
          unit_type,
          floor_number,
          area,
          annual_rent,
          occupancy_status,
          current_contract_id
        `)
        .eq("property_id", propertyId)
        .order("unit_number");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["property-contracts", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, tenant_name, monthly_rent")
        .eq("property_id", propertyId)
        .eq("status", "نشط");

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        لا توجد وحدات مسجلة لهذا العقار
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
      {units.map((unit) => {
        const contract = contracts?.find((c) => c.id === unit.current_contract_id);
        const isOccupied = unit.occupancy_status === "مشغول";

        return (
          <Card
            key={unit.id}
            className={`border-l-4 ${
              isOccupied ? "border-l-success" : "border-l-border"
            }`}
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-sm">{unit.unit_number}</h5>
                  <Badge
                    variant={isOccupied ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {unit.occupancy_status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>النوع: {unit.unit_type || "غير محدد"}</p>
                  {unit.floor_number && <p>الطابق: {unit.floor_number}</p>}
                  {unit.area && <p>المساحة: {unit.area} م²</p>}
                  {unit.annual_rent && (
                    <p className="text-primary font-medium">
                      {formatCurrency(unit.annual_rent / 12)}/شهر
                    </p>
                  )}
                  {contract && (
                    <div className="pt-1 border-t mt-2">
                      <p className="font-medium text-foreground">
                        المستأجر: {contract.tenant_name}
                      </p>
                     <p className="text-success font-medium">
                        {formatCurrency(contract.monthly_rent)}/شهر
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
