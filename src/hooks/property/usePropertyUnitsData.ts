/**
 * Property Units Data Hook - خطاف بيانات وحدات العقار
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services";

export function usePropertyUnits(propertyId: string) {
  const query = useQuery({
    queryKey: ["property-units-data", propertyId],
    queryFn: () => PropertyService.getPropertyUnitsAndContracts(propertyId),
    enabled: !!propertyId,
  });

  return {
    units: query.data?.units,
    contracts: query.data?.contracts,
    isLoading: query.isLoading,
  };
}
