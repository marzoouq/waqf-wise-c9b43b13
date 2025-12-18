/**
 * PropertyUnitsDisplay - مكون عرض وحدات العقار
 */

import { usePropertyUnits } from "@/hooks/property/usePropertyUnitsData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { getUnitTypeLabel } from "@/lib/constants";

interface PropertyUnitsDisplayProps {
  propertyId: string;
}

export function PropertyUnitsDisplay({ propertyId }: PropertyUnitsDisplayProps) {
  const { units, contracts, isLoading } = usePropertyUnits(propertyId);

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
            className={`border-s-4 ${
              isOccupied ? "border-s-success" : "border-s-border"
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
                  <p className="truncate">النوع: {getUnitTypeLabel(unit.unit_type)}</p>
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
