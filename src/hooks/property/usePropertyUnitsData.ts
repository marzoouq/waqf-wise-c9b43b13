/**
 * Property Units Data Hook - خطاف بيانات وحدات العقار
 * @version 2.8.35
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePropertyUnits(propertyId: string) {
  const unitsQuery = useQuery({
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

  const contractsQuery = useQuery({
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

  return {
    units: unitsQuery.data,
    contracts: contractsQuery.data,
    isLoading: unitsQuery.isLoading,
  };
}
