/**
 * Property Units Data Hook - خطاف بيانات وحدات العقار
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export function usePropertyUnits(propertyId: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.PROPERTY_UNITS_DATA(propertyId),
    queryFn: () => PropertyService.getPropertyUnitsAndContracts(propertyId),
    enabled: !!propertyId,
  });

  return {
    units: query.data?.units,
    contracts: query.data?.contracts,
    isLoading: query.isLoading,
  };
}
