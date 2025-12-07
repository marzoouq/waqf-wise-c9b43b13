/**
 * PropertyUnitsDisplay - مكون عرض وحدات العقار
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PropertyUnitsDisplayProps {
  propertyId: string;
}

export function PropertyUnitsDisplay({ propertyId }: PropertyUnitsDisplayProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-2">
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
            <CardContent className="p-2 sm:p-3">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-semibold text-xs sm:text-sm truncate flex-1 min-w-0">
                    {unit.unit_number}
                  </h5>
                  <Badge
                    variant={isOccupied ? "default" : "secondary"}
                    className="text-[10px] sm:text-xs shrink-0"
                  >
                    {unit.occupancy_status}
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-muted-foreground">
                  <p className="truncate">النوع: {unit.unit_type || "غير محدد"}</p>
                  {unit.floor_number && <p>الطابق: {unit.floor_number}</p>}
                  {unit.area && <p>المساحة: {unit.area} م²</p>}
                  {unit.annual_rent && (
                    <p className="text-primary font-medium truncate">
                      {formatCurrency(unit.annual_rent / 12)}/شهر
                    </p>
                  )}
                  {contract && (
                    <div className="pt-1 border-t mt-1.5 sm:mt-2">
                      <p className="font-medium text-foreground truncate">
                        المستأجر: {contract.tenant_name}
                      </p>
                      <p className="text-success font-medium truncate">
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
